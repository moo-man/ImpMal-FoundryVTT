export default class ImpMalActorSheet extends ActorSheet
{
    static get defaultOptions()
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "actor"]);
        options.resizable = true;
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }];
        return options;
    }

    get template()
    {
        return `systems/impmal/templates/actor/${this.actor.type}-sheet.hbs`;
    }

    async getData()
    {
        let data = super.getData();
        data.system = data.actor.system;
        data.items = this.organizeItems(data);
        data.effects = this.organizeEffects(data);
        data.hitLocations = this.formatHitLocations(data);
        return data;
    }


    organizeItems(data)
    {
        let sheetItems = data.actor.itemCategories;

        sheetItems.equipped = {
            melee : sheetItems.weapon.filter(i => i.system.equipped.value && i.system.attackType == "melee"),
            ranged : sheetItems.weapon.filter(i => i.system.equipped.value && i.system.attackType == "ranged"),
            protection : sheetItems.protection.filter(i => i.system.equipped.value),
            equipment : sheetItems.equipment.filter(i => i.system.equipped.value)
        };
        return sheetItems;
    }

    organizeEffects(data)
    {
        let effects = {
            passive : data.actor.effects.filter(e => !e.isTemporary && !e.disabled),
            active: data.actor.effects.filter(e => e.isTemporary && !e.disabled),
            disabled : data.actor.effects.filter(e => e.disabled)
        };

        return effects;
    }

    formatHitLocations(data)
    {
        if (data.actor.system.combat?.hitLocations)
        {
            return Object.values(data.actor.system.combat.hitLocations)
                .sort((a, b) => a.range[0] - b.range[0])
                .map(i =>
                {
                    if (i.range[0] != i.range[1])
                    {
                        i.displayRange = `${i.range[0]}-${i.range[1]}`;
                    }
                    else
                    {
                        i.displayRange = i.range[0];
                    }
                    return i;
                });
        }
    }


    /**
     * By default, Foundry prevents editing of any property that is being affected by Active Effects
     * I don't like this, so to prevent feedback loops of constant updating, diff the update object
     * with the *derived* actor data
     *
     * @param {Object} updateData
     * @returns
     */
    _getSubmitData(updateData = {})
    {
        this.actor.overrides = {};
        const data = super._getSubmitData(updateData);

        // Diff the update with the derived actor data to unwanted constant incremental updates
        const diff = foundry.utils.diffObject(foundry.utils.flattenObject(this.object.toObject(false)), data);
        return diff;
    }

    activateListeners(html)
    {
        super.activateListeners(html);

        html.find(".list-edit").on("click", this._onListEdit.bind(this));
        html.find(".list-delete").on("click", this._onListDelete.bind(this));
        html.find(".list-create").on("click", this._onListCreate.bind(this));
        html.find(".list-toggle").on("click", this._onListToggle.bind(this));
        html.find(".list-post").on("click", this._onPostItem.bind(this));
        html.find(".faction-delete").on("click", this._onFactionDelete.bind(this));
        html.find(".faction-create").on("click", this._onFactionCreate.bind(this));
        html.find(".property-edit").on("click", this._onPropertyEdit.bind(this));
        html.find(".ammo-selector").on("change", this._onChangeAmmo.bind(this));
        html.find(".roll").on("click", this._onRollClick.bind(this));
    }

    //#region Sheet Listeners
    _onListEdit(event)
    {
        let el = $(event.currentTarget).parents("[data-id]");
        let id = el.attr("data-id");
        let collection = el.attr("data-collection") || "items";

        return this.actor[collection].get(id)?.sheet.render(true);
    }
    _onListDelete(event)
    {
        let el = $(event.currentTarget).parents(".list-item");
        let id = el.attr("data-id");
        let collection = el.attr("data-collection");

        let docName = collection == "item" ? "Item" : "ActiveEffect";

        Dialog.confirm({
            title: game.i18n.localize(`IMPMAL.Delete${docName}`),
            content: `<p>${game.i18n.localize(`IMPMAL.Delete${docName}Confirmation`)}</p>`,
            yes: () => {this.actor.deleteEmbeddedDocuments(docName, [id]);},
            no: () => {},
            defaultYes: true
        });
    }
    _onListCreate(event)
    {
        let type = event.currentTarget.dataset.type;
        if (type=="effect")
        {
            return this._onEffectCreate(event);
        }

        let createData = { name: `New ${game.i18n.localize(CONFIG.Item.typeLabels[type])}`, type };

        return this.actor.createEmbeddedDocuments(docName, [createData]);
    }

    _onPostItem(event)
    {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id");
        if (itemId) {return this.actor.items.get(itemId)?.postToChat();}
    }

    async _onEffectCreate(ev)
    {
        let type = ev.currentTarget.dataset.category;
        let effectData = { label: game.i18n.localize("IMPMAL.NewEffect"), icon: "icons/svg/aura.svg" };
        if (type == "temporary")
        {
            effectData["duration.rounds"] = 1;
        }
        else if(type == "disabled")
        {
            effectData.disabled = true;
        }

        let html = await renderTemplate("systems/impmal/templates/apps/quick-effect.html", effectData);
        new Dialog({
            title: game.i18n.localize("IMPMAL.QuickEffect"),
            content: html,
            buttons: {
                create: {
                    label: "Create",
                    callback: (html) =>
                    {
                        let mode = 2;
                        let label = html.find(".label").val();
                        let key = html.find(".key").val();
                        let value = parseInt(html.find(".modifier").val()?.toString() || "");
                        effectData.label = label;
                        effectData.changes = [{ key, mode, value }];
                        this.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
                    },
                },
                skip: {
                    label: "Skip",
                    callback: () => this.actor.createEmbeddedDocuments("ActiveEffect", [effectData]),
                },
            },
            render: (dlg) =>
            {
                $(dlg).find(".label").select();
            },
        }).render(true);
    }

    _onListToggle(ev)
    {
        let id = $(ev.currentTarget).parents(".list-item").attr("data-id");
        let effect = this.object.effects.get(id);

        if (effect) {effect.update({ disabled: !effect.disabled });}
    }

    _onFactionDelete(ev)
    {
        let el = $(ev.currentTarget).parents(".list-item");
        let faction = el.attr("data-type");

        Dialog.confirm({
            title: game.i18n.localize(`IMPMAL.DeleteFaction`),
            content: `<p>${game.i18n.localize(`IMPMAL.DeleteFactionConfirmation`)}</p>`,
            yes: () => {this.actor.update(this.actor.system.influence.deleteFaction(faction));},
            no: () => {},
            defaultYes: true
        });
    }


    /**
     *  Generic property editing via the sheet, supports editing items with the `data-id` property,
     *  can specify ("data-collection" as "effects" to edit effects instead)
     */
    _onPropertyEdit(event)
    {
        let id = event.currentTarget.dataset.id;
        let target = event.currentTarget.dataset.target;
        let collection = event.currentTarget.dataset.collection || "items";
        let value = event.target.value;

        let doc = this.actor;
        if (id)
        {
            doc = this.actor[collection].get(id);
        }

        if (Number.isNumeric(value))
        {
            value = Number(value);
        }
        else if (event.currentTarget.classList.contains("boolean")) // toggling a boolean
        {
            value = !getProperty(doc, target);
        }


        return doc.update({[target] : value});
    }

    _onFactionCreate()
    {
        new Dialog({
            title : "IMPMAL.AddInfluence",
            content : `
            <form>
                <div class="form-group">
                    <label>${game.i18n.localize("IMPMAL.Faction")}</label>
                    <input type="text">
                </div>
            </form>`,
            buttons : {
                submit : {
                    label : game.i18n.localize("Submit"),
                    callback: (dlg) =>
                    {
                        let faction = dlg.find("input")[0].value;
                        this.actor.update({"system.influence" : this.actor.system.influence.createFaction(faction)});
                    }
                }
            },
            default : "submit"
        }).render(true);
    }

    _onChangeAmmo(ev)
    {
        let el = $(ev.currentTarget).parents(".list-item");
        let id = el.attr("data-id");
        let item = this.actor.items.get(id);

        item.update({"system.ammo.id" : ev.target.value});
    }

    _onRollClick(ev)
    {
        let type = ev.currentTarget.dataset.type;  // characteristic, skill, etc.
        let key = ev.currentTarget.dataset.key;    // Non items, such as characteristic keys, or skill keys
        let itemId = ev.currentTarget.dataset.itemId;  // Item ids, if using skill items or weapons

        switch(type)
        {
        case "characteristic":
            return this.actor.setupCharacteristicTest(key);
        case "skill":
            return this.actor.setupSkillTest({itemId, key});
        case "weapon":
            return this.actor.setupWeaponTest(itemId);
        case "power":
            return this.actor.setupPowerTest(itemId);
        }
    }
    //#endregion
}