
export default ImpMalSheetMixin = (cls) => class extends cls 
{

    get document()
    {
        return this.object;
    }
    
    constructor(...args)
    {
        super(...args);
        warhammer.utility.addSheetHelpers(this);
    }

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
        game.impmal.utility.listeners(html);
    }
    //#region Sheet Listeners
    _onListEdit(event) 
    {
        let document = this._getDocument(event);

        return document?.sheet.render(true, {editable : this.options.editable});
    }
    _onListDelete(event, skipDialog=false) 
    {
        let collection = this._getCollection(event);

        let docName = collection == "effects" ? "ActiveEffect" : "Item";

        let document = this._getDocument(event);

        if (skipDialog)
        {
            return document?.delete();
        }
        else 
        {
            return Dialog.confirm({
                title: game.i18n.localize(`IMPMAL.Delete${docName}`),
                content: `<p>${game.i18n.localize(`IMPMAL.Delete${docName}Confirmation`)}</p>`,
                yes: () => { document.delete(); },
                no: () => { },
                defaultYes: true
            });
        }
    }
    async _onListCreate(event) 
    {
        let type = event.currentTarget.dataset.type;
        let category = event.currentTarget.dataset.category;
        if (type == "effect") 
        {
            return this._onEffectCreate.bind(this)(event);
        }

        let types = type.split(",").map(i => i.trim());
        if (types.length != 1)
        {
            let buttons = {};
            for(let t of types)
            {
                buttons[t] = {
                    label : game.i18n.localize(CONFIG.Item.typeLabels[t]),
                    callback : () => 
                    {
                        return t;
                    }
                };
            }
            let choice = await Dialog.wait({
                title : game.i18n.localize("IMPMAL.SelectItemType"),
                content : game.i18n.localize("IMPMAL.SelectItemTypeHint"),
                buttons
            });

            type = choice;
        }


        let createData = { name: `New ${game.i18n.localize(CONFIG.Item.typeLabels[type])}`, type };
        if (category) 
        {
            createData["system.category"] = category;
        }

        return this.object.createEmbeddedDocuments("Item", [createData]).then(items => items[0].sheet.render(true));
    }

    _onCreateArrayElement(ev)
    {
        let target = ev.currentTarget.dataset.target; // Location of the list model
        let arrayModel = getProperty(this.item, target);
        if (arrayModel instanceof Array)
        {
            return this.item.update({[target] : arrayModel.concat(null)});
        }
        else 
        {
            return this.item.update({[target + ".list"] : arrayModel.add()});
        }
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

        if (arrayModel instanceof Array)
        {
            let newArray = foundry.utils.deepClone(arrayModel);
            newArray[index] = value;
            return this.item.update({[target] : newArray});
        }
        else 
        {
            return this.item.update({[target + ".list"] : arrayModel.edit(index, value)});
        }
    }

    _onDeleteArrayElement(ev)
    {
        let target = ev.currentTarget.parentElement.dataset.target;    // Location of the list model
        let index = ev.currentTarget.parentElement.dataset.index;      // Index to be deleted
        let arrayModel = getProperty(this.item, target);
        
        if (arrayModel instanceof Array)
        {
            let newArray = foundry.utils.deepClone(arrayModel);
            newArray.splice(index, 1);
            return this.item.update({[target] : newArray});
        }
        else 
        {
            return this.item.update({[target + ".list"] : arrayModel.remove(index)});
        }
    }

    _onPostItem(event) 
    {
        let itemId = this._getId(event);
        if (itemId) { return this.object.items.get(itemId)?.postItem(); }
    }

    async _onEffectCreate(ev) 
    {
        let type = ev.currentTarget.dataset.category;
        let effectData = { name: game.i18n.localize("IMPMAL.NewEffect"), icon: "icons/svg/aura.svg" };
        if (type == "temporary") 
        {
            effectData["duration.rounds"] = 1;
        }
        else if (type == "disabled") 
        {
            effectData.disabled = true;
        }

        // If Item effect, use item name for effect name
        if (this.object.documentName == "Item")
        {
            effectData.name = this.object.name;
        }
        this.object.createEmbeddedDocuments("ActiveEffect", [effectData]).then(effects => effects[0].sheet.render(true));
    }

    _onListToggle(event) 
    {
        let document = this._getDocument(event);
        // Alert the user when trying to change disabled/enabled when it's managed by a script
        if (document.conditionScript)
        {
            return ui.notifications.notify(game.i18n.localize("IMPMAL.EffectConditionScriptCannotChange"));
        }
        document?.update({ disabled: !document.disabled }).then(updated => 
        {
            // If you disable a patron effect, the update won't cause a rerender because it's an effect from another document, so rerender and reprepare manually
            if (this._isPatronDocument(updated))
            {
                warhammer.utility.log("Rerendering Sheet and Repreparing from Patron Update");
                this.object.reset();
                this.render(true);
            }
        });
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
        ev.stopPropagation();
        let path = this._getPath(ev);
        let faction = this._getType(ev);

        Dialog.confirm({
            title: game.i18n.localize(`IMPMAL.DeleteFaction`),
            content: `<p>${game.i18n.localize(`IMPMAL.DeleteFactionConfirmation`)}</p>`,
            yes: () => {this.object.update(getProperty(this.object, path).deleteFaction(faction));},
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
                        this.object.update(getProperty(this.object, path).createFaction(faction));
                    }
                }
            },
            default : "submit"
        }).render(true);
    }

    _onScriptConfig(ev)
    {
        new WarhammerScriptConfig(this.object, {path : this._getPath(ev)}).render(true);
    }

    
    // Normal actors can update patron actors from their sheet
    // This helper checks whether the document was a patron (or its embedded documents)
    _isPatronDocument(document)
    {
        return this.object.id != document.id &&
            ((document.documentName == "Actor" && document.type == "patron") || 
            (document.actor?.type == "patron"));
    }

};