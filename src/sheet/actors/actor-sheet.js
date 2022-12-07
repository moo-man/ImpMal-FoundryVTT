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
        data.hitLocations = this.formatHitLocations(data);
        return data;
    }


    organizeItems(data) 
    {
        let sheetItems = data.actor.itemCategories;
        return sheetItems;
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


    activateListeners(html) 
    {
        super.activateListeners(html);

        html.find(".list-edit").on("click", this._onListEdit.bind(this));
        html.find(".list-delete").on("click", this._onListDelete.bind(this));
        html.find(".list-create").on("click", this._onListCreate.bind(this));
        html.find(".list-post").on("click", this._onPostItem.bind(this));
        html.find(".faction-delete").on("click", this._onFactionDelete.bind(this));
        html.find(".faction-create").on("click", this._onFactionCreate.bind(this));
    }

    _onListEdit(event) 
    {
        let el = $(event.currentTarget).parents(".list-item");
        let id = el.attr("data-id");
        let collection = el.attr("data-collection");

        return this.actor[collection].get[id]?.sheet.render(true);
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
        let el = $(event.currentTarget).parents(".list-item");
        let collection = el.attr("data-collection");
        let docName = collection == "item" ? "Item" : "ActiveEffect";
        let createData = {};

        if (docName == "Item")
        {
            let type = event.currentTarget.dataset.type;
            createData = { name: `New ${getGame().i18n.localize(CONFIG.Item.typeLabels[type])}`, type };
        }
        else 
        {
            createData = { name: `New Active Effect`};
        }
    
        return this.actor.createEmbeddedDocuments(docName, [createData]);
    }
    
    _onPostItem(event) 
    {
        let itemId = $(event.currentTarget).parents(".item").attr("data-item-id");
        if (itemId) {return this.actor.items.get(itemId)?.postToChat();}
    }
    
    async _onEffectCreate(ev) 
    {
        let type = (ev.currentTarget).dataset["type"];
        let effectData = { label: getGame().i18n.localize("IMPMAL.NewEffect"), icon: "icons/svg/aura.svg" };
        if (type == "temporary") 
        {
            effectData["duration.rounds"] = 1;
        }
    
        let html = await renderTemplate("systems/IMPMAL-of-eternity/templates/apps/quick-effect.html", effectData);
        new Dialog({
            title: getGame().i18n.localize("IMPMAL.QuickEffect"),
            content: html,
            buttons: {
                create: {
                    label: "Create",
                    callback: (html) => 
                    {
                        html = $(html);
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
        });
    }
    
    _onEffectEdit(ev) 
    {
        let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
        this.object.effects.get(id)?.sheet?.render(true);
    }
    
    _onEffectDelete(ev) 
    {
        let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
        if (id) {this.object.deleteEmbeddedDocuments("ActiveEffect", [id]);}
    }
    
    _onEffectToggle(ev) 
    {
        let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
        let effect = this.object.effects.get(id);
    
        if (effect) {effect.update({ disabled: !effect.data.disabled });}
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
}