import addListListeners, { _getId } from "../../apps/list-listeners";

export default class ImpMalActorSheet extends ActorSheet
{
    static get defaultOptions()
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "actor"]);
        options.resizable = true;
        options.scrollY = [".tab-content"];
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }];
        return options;
    }

    get template()
    {
        return `systems/impmal/templates/actor/${this.actor.type}-sheet.hbs`;
    }

    async getData()
    {
        let data = await super.getData();
        data.system = data.actor.system;
        data.items = this.organizeItems(data);
        data.effects = this.organizeEffects(data);
        data.hitLocations = this.formatHitLocations(data);
        data.conditions = this.formatConditions(data);
        return data;
    }


    organizeItems(data)
    {
        let sheetItems = data.actor.itemCategories;

        sheetItems.equipped = {
            melee : sheetItems.weapon.filter(i => i.system.equipped.value && i.system.attackType == "melee"),
            ranged : sheetItems.weapon.filter(i => i.system.equipped.value && i.system.attackType == "ranged"),
            protection : sheetItems.protection.filter(i => i.system.equipped.value).filter(i => i.system.category != "shield"),
            shield : sheetItems.protection.filter(i => i.system.equipped.value).filter(i => i.system.category == "shield"),
            equipment : sheetItems.equipment.filter(i => i.system.equipped.value)
        };
        return sheetItems;
    }

    organizeEffects(data)
    {
        let effects = {
            active: data.actor.effects.filter(e => e.isTemporary && !e.disabled),
            passive : data.actor.effects.filter(e => !e.isTemporary && !e.disabled),
            disabled : data.actor.effects.filter(e => e.disabled)
        };

        return effects;
    }

    formatConditions(data)
    {
        let conditions = foundry.utils.deepClone(CONFIG.statusEffects);
        conditions.forEach(c =>
        {
            c.boolean = game.impmal.config.booleanCondition[c.id];
            c.existing = data.actor.hasCondition(c.id);
            c.opacity = 30;

            // Conditions have 1 or 2 pips, two for minor/major
            // If condition existis on actor, it must have at least one filled pip
            c.pips = [{filled : c.existing, type : "minor"}]; 

            // If not boolean (minor/major), add another pip, filled if major
            if (!c.boolean) 
            {
                c.pips.push({filled : c.existing?.isMajor, type : "major"});
            }

            if ((c.boolean && c.existing) || c.existing?.isMajor)
            {
                c.opacity = 100;
            }
            else if (c.existing?.isMinor)
            {
                c.opacity = 60;
            }
        });
        return conditions;
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
        addListListeners(html, this);

        html.find(".faction-delete").on("click", this._onFactionDelete.bind(this));
        html.find(".faction-create").on("click", this._onFactionCreate.bind(this));
        html.find(".property-edit").on("click", this._onPropertyEdit.bind(this));
        html.find(".inc-dec").on("mousedown", this._onIncDec.bind(this));
        html.find(".ammo-selector").on("change", this._onChangeAmmo.bind(this));
        html.find(".reload").on("click", this._onReload.bind(this));
        html.find(".roll").on("click", this._onRollClick.bind(this));
        html.find(".trait-action").on("click", this._onTraitClick.bind(this));
        html.find(".pip").on("click", this._onConditionPipClick.bind(this));
        html.find(".remove-singleton").on("click", this._onRemoveSingleton.bind(this));
        html.find(".remove-ref").on("click", this._onRemoveReference.bind(this));
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
        let id = _getId(event);
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

    _onIncDec(ev)
    {
        let id = _getId(ev);
        let item = this.actor.items.get(id);
        let button = ev.button == 0 ? "left" : "right";

        if (button =="left")
        {
            item.update(item.system.increase());
        }
        if (button =="right")
        {
            item.update(item.system.decrease());
        }
    }

    _onChangeAmmo(ev)
    {
        let id = _getId(ev);
        let item = this.actor.items.get(id);

        item.update({"system.ammo.id" : ev.target.value});
    }

    _onReload(ev)
    {
        let id = _getId(ev);
        let item = this.actor.items.get(id);

        try 
        {
            item.update(item.system.reload());
        }
        catch(e)
        {
            ui.notifications.error(e);
        }
    }

    _onRollClick(ev)
    {
        let type = ev.currentTarget.dataset.type;  // characteristic, skill, etc.
        let key = ev.currentTarget.dataset.key;    // Non items, such as characteristic keys, or skill keys
        let itemId = _getId(ev);                   // Item ids, if using skill items or weapons

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

    _onTraitClick(ev)
    {
        let itemId = _getId(ev);      
        if(ev.currentTarget.dataset.action == "attack")
        {
            this.actor.setupTraitTest(itemId);
        }
    }


    _onConditionPipClick(ev)
    {
        let key = ev.currentTarget.dataset.key;
        let type = ev.currentTarget.dataset.type;
        let existing = this.actor.hasCondition(key);

        if (!existing || (existing?.isMinor && type == "major"))
        {
            this.actor.addCondition(key, {type});
        }
        else 
        {
            this.actor.removeCondition(key);
        }
    }

    _onRemoveSingleton(ev)
    {
        let type = ev.currentTarget.dataset.type;

        this.actor.system[type]?.document?.delete();
    }

    
    _onRemoveReference(ev)
    {
        ev.stopPropagation();
        this.actor.update({[`${ev.currentTarget.dataset.path}.id`] : ""});
    }

    //#endregion
}