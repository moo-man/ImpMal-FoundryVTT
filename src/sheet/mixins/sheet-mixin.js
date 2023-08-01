import ScriptConfig from "../../apps/script-config";

export default ImpMalSheetMixin = (cls) => class extends cls 
{
    // Shared listeners between different document sheets

    formatConditions()
    {
        let conditions = foundry.utils.deepClone(CONFIG.statusEffects);
        conditions.forEach(c =>
        {
            c.boolean = !game.impmal.config.tieredCondition[c.id];
            c.existing = this.object.hasCondition(c.id);
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

    /**
     * Override dragStart handler to handle universal list HTML
     */
    _onDragStart(event) 
    {
        const li = event.currentTarget;
        if ( event.target.classList.contains("content-link") )
        { 
            return;
        }
     
        // Create drag data
        let dragData;
     
        // Owned Items
        const document = this.object[this._getCollection(event)].get(li.dataset.id);
        dragData = document.toDragData();
     
        if ( !dragData ) 
        {
            return;
        }
     
        // Set data transfer
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }
     


    addGenericListeners(html) 
    {
        html.find("input[type='number']").on("focusin", (ev) => ev.target.select());
        html.find(".list-edit").on("click", this._onListEdit.bind(this));
        html.find(".list-edit-rc").on("contextmenu", this._onListEdit.bind(this));
        html.find(".list-delete").on("click", this._onListDelete.bind(this));
        html.find(".list-delete-rc").on("click", this._onListDelete.bind(this));
        html.find(".list-create").on("click", this._onListCreate.bind(this));
        html.find(".list-toggle").on("click", this._onListToggle.bind(this));
        html.find(".array-create").click(this._onCreateArrayElement.bind(this));
        html.find(".array-edit").change(this._onEditArrayElement.bind(this));
        html.find(".array-delete").click(this._onDeleteArrayElement.bind(this));
        html.find(".list-post").on("click", this._onPostItem.bind(this));
        html.find(".pip").on("click", this._onConditionPipClick.bind(this));
        html.find(".faction-delete").on("click", this._onFactionDelete.bind(this));
        html.find(".faction-create").on("click", this._onFactionCreate.bind(this));
        html.find(".script-config").on("click", this._onScriptConfig.bind(this));
    }

    _getId(ev) 
    {
        return this._getDataAttribute(ev, "id");
    }
    
    _getIndex(ev) 
    {
        return Number(this._getDataAttribute(ev, "index"));
    }

    _getKey(ev) 
    {
        return this._getDataAttribute(ev, "key");
    }

    _getType(ev) 
    {
        return this._getDataAttribute(ev, "type");
    }

    _getPath(ev) 
    {
        return this._getDataAttribute(ev, "path");
    }

    _getCollection(ev) 
    {
        return this._getDataAttribute(ev, "collection") || "items";
    }


    /**
     * Search for an HTML data property, specified as data-<property>
     * First search target of the event, then search in parent properties
     * 
     * @param {Event} ev Event triggered
     * @param {String} property data-<property> being searched for
     * @returns 
     */
    _getDataAttribute(ev, property)
    {
        let value = ev.currentTarget.dataset[property];

        if (!value) 
        {
            const parent = $(ev.currentTarget).parents(`[data-${property}]`);
            if (parent) 
            {
                value = parent[0]?.dataset[property];
            }
        }
        return value;
    }

    //#region Sheet Listeners
    _onListEdit(event) 
    {
        let id = this._getId(event);
        let collection = this._getCollection(event);
        let itemId = this._getDataAttribute(event, "item");

        // If item id is defined, find the item and search in its collection instead
        let document = (itemId && collection == "effects") ? this.object.items.get(itemId)[collection].get(id) : this.object[collection].get(id);

        return document?.sheet.render(true, {editable : this.options.editable});
    }
    _onListDelete(event, skipDialog=false) 
    {
        let id = this._getId(event);
        let collection = this._getCollection(event);

        let docName = collection == "effects" ? "ActiveEffect" : "Item";

        if (skipDialog)
        {
            return this.object.deleteEmbeddedDocuments(docName, [id]);
        }
        else 
        {
            return Dialog.confirm({
                title: game.i18n.localize(`IMPMAL.Delete${docName}`),
                content: `<p>${game.i18n.localize(`IMPMAL.Delete${docName}Confirmation`)}</p>`,
                yes: () => { this.object.deleteEmbeddedDocuments(docName, [id]); },
                no: () => { },
                defaultYes: true
            });
        }
    }
    _onListCreate(event) 
    {
        let type = event.currentTarget.dataset.type;
        let category = event.currentTarget.dataset.category;
        if (type == "effect") 
        {
            return this._onEffectCreate.bind(this)(event);
        }


        let createData = { name: `New ${game.i18n.localize(CONFIG.Item.typeLabels[type])}`, type };
        if (category) 
        {
            createData["system.category"] = category;
        }

        return this.object.createEmbeddedDocuments("Item", [createData]);
    }

    _onCreateArrayElement(ev)
    {
        let target = ev.currentTarget.dataset.target; // Location of the list model
        let arrayModel = getProperty(this.item, target);
        return this.item.update({[target + ".list"] : arrayModel.add()});
    }

    _onEditArrayElement(ev)
    {
        let target = ev.currentTarget.parentElement.dataset.target;    // Location of the list model
        let index = ev.currentTarget.parentElement.dataset.index;      // Index to be edited
        let property = ev.currentTarget.dataset.property;       // Property to be edited (if element is an object)

        let arrayModel = getProperty(this.item, target);

        let value;

        // If property is specified, means that array elements are objects
        // Only edit that property specified
        if (property)
        {
            value = {[`${property}`] : ev.target.value};
        }
        else // If no property specified, it must be a string or number
        {
            value = ev.target.value;
            if (Number.isNumeric(value))
            {
                value = Number(value);
            }
        }

        return this.item.update({[target + ".list"] : arrayModel.edit(index, ev.target.value)});
    }

    _onDeleteArrayElement(ev)
    {
        let target = ev.currentTarget.parentElement.dataset.target;    // Location of the list model
        let index = ev.currentTarget.parentElement.dataset.index;      // Index to be deleted
        let arrayModel = getProperty(this.item, target);
        return this.item.update({[target + ".list"] : arrayModel.remove(index)});
    }

    _onPostItem(event) 
    {
        let itemId = this._getId(event);
        if (itemId) { return this.object.items.get(itemId)?.postToChat(); }
    }

    async _onEffectCreate(ev) 
    {
        let type = ev.currentTarget.dataset.category;
        let effectData = { label: game.i18n.localize("IMPMAL.NewEffect"), icon: "icons/svg/aura.svg" };
        if (type == "temporary") 
        {
            effectData["duration.rounds"] = 1;
        }
        else if (type == "disabled") 
        {
            effectData.disabled = true;
        }
        this.object.createEmbeddedDocuments("ActiveEffect", [effectData]).then(effects => effects[0].sheet.render(true));
    }

    _onListToggle(ev) 
    {
        let id = this._getId(ev);
        let itemId = this._getDataAttribute(ev, "item");

        let effect = itemId ? this.object.items.get(itemId).effects.get(id) : this.object.effects.get(id);

        if (effect) { effect.update({ disabled: !effect.disabled }); }
    }

    _onConditionPipClick(ev)
    {
        let key = ev.currentTarget.dataset.key;
        let type = ev.currentTarget.dataset.type;
        let existing = this.object.hasCondition(key);

        if (!existing || (existing?.isMinor && type == "major"))
        {
            this.object.addCondition(key, {type});
        }
        else 
        {
            this.object.removeCondition(key);
        }
    }

    _onFactionDelete(ev)
    {
        let path = this._getPath(ev);
        let faction = this._getType(ev);

        Dialog.confirm({
            title: game.i18n.localize(`IMPMAL.DeleteFaction`),
            content: `<p>${game.i18n.localize(`IMPMAL.DeleteFactionConfirmation`)}</p>`,
            yes: () => {this.object.update(getProperty(this.object, path).deleteFaction(faction, path));},
            no: () => {},
            defaultYes: true
        });
    }

    
    _onFactionCreate(ev)
    {
        let path = this._getPath(ev);
        new Dialog({
            title : game.i18n.localize("IMPMAL.AddInfluence"),
            content : `
            <form>
                <div class="form-group">
                    <label>${game.i18n.localize("IMPMAL.Faction")}</label>
                    <input type="text" list="factions">
                    <datalist id="factions">
                    ${Object.keys(game.impmal.config.factions).map(f => `<option>${game.impmal.config.factions[f]}</option>`)}
                    </datalist>
                </div>
            </form>`,
            buttons : {
                submit : {
                    label : game.i18n.localize("Submit"),
                    callback: (dlg) =>
                    {
                        let faction = dlg.find("input")[0].value;
                        this.object.update(getProperty(this.object, path).createFaction(faction, path));
                    }
                }
            },
            default : "submit"
        }).render(true);
    }

    _onScriptConfig(ev)
    {
        new ScriptConfig(this.object, {path : this._getPath(ev)}).render(true);
    }
};