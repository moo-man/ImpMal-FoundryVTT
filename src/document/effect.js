import ImpMalScript from "../system/script";

export class ImpMalEffect extends ActiveEffect
{

    async _preCreate(data, options, user)
    {
        await super._preCreate(data, options, user);

        let preventCreation = false;
        preventCreation = await this._handleEffectAvoidance(data, options, user);
        if (preventCreation)
        {
            ui.notifications.notify(game.i18n.format("IMPMAL.EffectAvoided", {name : this.name}));
            return false; // If avoided is true, return false to stop creation
        }
        preventCreation = await this._handleConditionCreation(data, options, user);
        if (preventCreation)
        {
            return false;
        }

        return await this._handleImmediateScripts(data, options, user);
    }

    async _onDelete(options, user)
    {
        await this.deleteCreatedItems();
        for(let script of this.scripts.filter(i => i.trigger == "deleteEffect"))
        {
            await script.execute({options, user});
        }
    }

    async _onUpdate(data, options, user)
    {
        await super._onUpdate(data, options, user);

        // If an owned effect is updated, run parent update scripts
        if (this.parent)
        {
            await this.parent.runScripts("updateDocument");
        }
    }

    async _onCreate(data, options, user)
    {
        await super._onCreate(data, options, user);

        // If an owned effect is created, run parent update scripts
        if (this.parent)
        {
            await this.parent.runScripts("updateDocument");
        }
    }

    //#region Creation Handling

    async _handleImmediateScripts()
    {
        let run = false;
        // Effect is direct parent, it's always applied to an actor, so run scripts
        if (this.parent?.documentName == "Actor")
        {
            run = true;
        }
        // If effect is grandchild, only run scripts if the effect should apply to the actor
        else if (this.parent?.documentName == "Item" && this.parent.parent?.documentName == "Actor" && this.transfer)
        {
            run = true;
        }
        // If effect is child of Item, and Item is what it's applying to
        else if (this.parent?.documentName == "Item" && this.applicationData.options.documentType == "Item")
        {
            run = true;
        }

        if (run)
        {
            let scripts = this.scripts.filter(i => i.trigger == "immediate");
            if (scripts.length)
            {
                await Promise.all(scripts.map(s => s.execute()));
                return !scripts.every(s => s.options.immediate?.deleteEffect);
            }
            // If all scripts agree to delete the effect, return false (to prevent creation);
        }
    }

    async _handleEffectAvoidance()
    {
        let actor = this.actor;

        // If no owning actor, no test can be done
        if (!actor)
        {
            return false;
        }

        let applicationData = this.applicationData;

        // If no test, cannot be avoided
        if (applicationData.options.avoidTest.value == "none")
        {
            return false;
        }

        let test;
        let options = {title : {append : " - Avoid " + this.name}};
        if (applicationData.options.avoidTest.value == "script")
        {
            let script = new ImpMalScript({label : this.effect + " Avoidance", string : applicationData.options.avoidTest.script}, ImpMalScript.createContext(this));
            return await script.execute();
        }
        else if (applicationData.options.avoidTest.value == "item")
        {
            test = await this.actor.setupTestFromItem(this.item.uuid, options);
        }
        else if (applicationData.options.avoidTest.value == "custom")
        {
            test = await this.actor.setupTestFromData(this.applicationData.options.avoidTest, options);
        }

        await test.roll();
        return test.succeeded;
    }
    
    /** 
     * This function handles creation of new conditions on an actor
     * If an Item adds a Condition, prevent that condition from being added, and instead call `addCondition` 
     * This prevents the Condition from being removed when the item is removed, but more importantly
     * `addCondition` handles Minor conditions turning into Major if a second Minor is added.
     * 
     * @param {ImpMalEffect} Effect being created
     * @returns 
     */
    async _handleConditionCreation(data, options)
    {
        // options.condition tells us that it has already gone through addCondition, so this avoids a loop
        if (this.isCondition && !options.condition) 
        {
            // If adding a condition, prevent it and go through `addCondition`
            this.parent.addCondition(this.key, {type : this.flags.impmal?.type, origin: this.origin});
            return true;
        }
    }
    /**
     * Delete all items created by scripts in this effect
     */
    deleteCreatedItems()
    {
        if (this.actor)
        {
            let createdItems = this.actor.items.filter(i => i.getFlag("impmal", "fromEffect"), this.id);
            if (createdItems.length)
            {
                ui.notifications.notify(game.i18n.format("IMPMAL.DeletingEffectItems", {items : createdItems.map(i => i.name).join(", ")}));
                return this.actor.deleteEmbeddedDocuments("Item", createdItems.map(i => i.id));
            }
        }
    }

    //#endregion

    prepareData() 
    {
        super.prepareData();

        if (this.applicationData.options.enableConditionScript && this.actor)
        {
            this.conditionScript = new ImpMalScript({string : this.applicationData.options.enableConditionScript, label : `Enable Script for ${this.name}`}, ImpMalScript.createContext(this));
            this.disabled = !this.conditionScript.execute();
        }

        // Refresh scripts
        this._scripts = undefined;

        if (this.parent.documentName == "Item")
        {
            this.transfer = this.determineTransfer();
        }
    }

    determineTransfer()
    {
        let application = this.applicationData;
        return application.type == "document" && application.options.documentType == "Actor";
    }

    // To be applied, some data needs to be changed
    // Convert type to document, as applying should always affect the document being applied
    // Set the origin as the actor's uuid
    // convert name to status so it shows up on the token
    convertToApplied()
    {
        let effect = this.toObject();
        effect.flags.impmal.applicationData.type == "document";
        effect.origin = this.actor?.uuid;
        effect.statuses = [this.key || effect.name.slugify()]; // this.key is prioritized if it's a condition, we don't want ablaze-(minor) as the key, just ablaze
        return effect;
    }

    get scripts()
    {  
        if (!this._scripts)
        {
            this._scripts = this.scriptData.map(i => new ImpMalScript(i, ImpMalScript.createContext(this)));
        }
        return this._scripts;
    }

    get item()
    {
        if (this.parent.documentName == "Item")
        {
            return this.parent;
        }
        else
        {
            return undefined;
        }
    }

    get actor()
    {
        if (this.parent.documentName == "Item")
        {
            return this.parent.parent;
        }
        else if (this.parent.documentName == "Actor")
        {
            return this.parent;
        }
        else 
        {
            return undefined;
        }
    }

    get source()
    {
        if (this.parent.documentName == "Item")
        {
            return this.parent.name; // TODO: a lot to change here, account for origin
        }
        else
        {
            return super.sourceName;
        }
    }

    get scriptData() 
    {
        return this.flags?.impmal?.scriptData || [];

        /**
         * label
         * string
         * trigger
         */
    }

    get key () 
    {
        return Array.from(this.statuses)[0];
    }

    get isCondition() 
    {
        return !!game.impmal.config.conditions.find(i =>i.id == this.key);
    }

    get isMinor()
    {
        return this.getFlag("impmal", "type") == "minor"; 
    }

    get isMajor()
    {
        return this.getFlag("impmal", "type") == "major"; 
    }

    // Computed effects mean flagged to know that they came from a calculation, notably encumbrance causing overburdened or restrained
    get isComputed()
    {
        return this.getFlag("impmal", "computed");
    }

    get applicationData() 
    {
        let applicationData = mergeObject(this.constructor._defaultApplicationData(), this.getFlag("impmal", "applicationData"));

        // // Delete non-relevant properties based on application type
        // if (applicationData.type == "document")
        // {
        //     delete applicationData.options.avoidTest;
        //     delete applicationData.options.filters;
        //     delete applicationData.options.prompt;
        //     delete applicationData.options.consume;
        // }

        // if (applicationData.type == "damage")
        // {
        //     delete applicationData.options.avoidTest;

        //     if (applicationData.options.documentType == "Actor")
        //     {
        //         delete applicationData.options.filters;
        //         delete applicationData.options.prompt;
        //     }

        //     delete applicationData.options.consume;
        // }

        return applicationData;
    }

    static findEffect(key, type="minor")
    {
        let effects = foundry.utils.deepClone(game.impmal.config.conditions).concat(foundry.utils.deepClone(Object.values(game.impmal.config.systemEffects)));

        let effect = effects.find(i => i.id == key && i.flags?.impmal?.type == type);
        if (!effect)
        {
            effect = effects.find(i => i.id == key);
        }
        return effect;
    }

    static getCreateData(effectData, overlay=false)
    {
        const createData = foundry.utils.deepClone(effectData);
        if ( overlay ) 
        {
            createData["flags.core.overlay"] = true;
        }
        delete createData.id;
        return createData;
    }



    static _defaultApplicationData() 
    {
        return {
            type : "document",
            options : {
                documentType : "Actor",
                avoidTest : { 
                    value : "none",
                    script : "",
                    difficulty : "",
                    characteristic : "",
                    skill : {
                        key : "",
                        specialisation : ""
                    }
                },
                enableConditionScript : "",
                filters : "",
                prompt : false,
                consume : false,

                
                dialog : {
                    hideScript : "",
                    activateScript : ""
                }
            }
        };
    }
}
