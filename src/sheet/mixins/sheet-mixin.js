export default ImpMalSheetMixin = (cls) => class extends cls 
{
    // Shared listeners between different document sheets

    formatConditions()
    {
        let conditions = foundry.utils.deepClone(CONFIG.statusEffects);
        conditions.forEach(c =>
        {
            c.boolean = game.impmal.config.booleanCondition[c.id];
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


    addGenericListeners(html) 
    {
        html.find(".list-edit").on("click", this._onListEdit.bind(this));
        html.find(".list-edit-rc").on("contextmenu", this._onListEdit.bind(this));
        html.find(".list-delete").on("click", this._onListDelete.bind(this));
        html.find(".list-delete-rc").on("click", this._onListDelete.bind(this));
        html.find(".list-create").on("click", this._onListCreate.bind(this));
        html.find(".list-toggle").on("click", this._onListToggle.bind(this));
        html.find(".list-post").on("click", this._onPostItem.bind(this));
        html.find(".pip").on("click", this._onConditionPipClick.bind(this));
    }

    _getId(ev) 
    {
        return this._getDataAttribute(ev, "id");
    }
    
    _getIndex(ev) 
    {
        return this._getDataAttribute(ev, "index");
    }

    _getKey(ev) 
    {
        return this._getDataAttribute(ev, "key");
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

        return this.object[collection].get(id)?.sheet.render(true, {editable : this.options.editable});
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

        let html = await renderTemplate("systems/impmal/templates/apps/quick-effect.hbs", effectData);
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
                        this.object.createEmbeddedDocuments("ActiveEffect", [effectData]);
                    },
                },
                skip: {
                    label: "Skip",
                    callback: () => this.object.createEmbeddedDocuments("ActiveEffect", [effectData]),
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
        let id = this._getId(ev);
        let effect = this.object.effects.get(id);

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
};