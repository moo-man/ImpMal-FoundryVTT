import DocumentChoice from "../apps/document-choice";
import log from "../system/logger";
import ImpMalScript from "../system/script";
import { SocketHandlers } from "../system/socket-handlers";

export class ImpMalEffect extends ActiveEffect
{

    async _preCreate(data, options, user)
    {
        await super._preCreate(data, options, user);

        // Take a copy of the test result that this effect comes from, if any
        // We can't use simply take a reference to the message id and retrieve the test as
        // creating a Test object before actors are ready (scripts can execute before that) throws errors
        this.updateSource({"flags.impmal.sourceTest" : game.messages.get(options.message)?.test});

        let preventCreation = false;
        preventCreation = await this._handleConditionCreation(data, options, user);
        if (preventCreation) // Conditions need to be handled before prevention because if it's a condition, it cancels and goes through creation again
        {
            return false;
        }
        preventCreation = await this._handleEffectPrevention(data, options, user);
        if (preventCreation)
        {
            ui.notifications.notify(game.i18n.format("IMPMAL.EffectPrevented", {name : this.name}));
            return false; // If avoided is true, return false to stop creation
        }
        preventCreation = await this._handleFilter(data, options, user);
        if (preventCreation)
        {
            log(game.i18n.format("IMPMAL.EffectFiltered", {name : this.name}), {force: true, args: this});
            return false;
        }
        await this._handleItemApplication(data, options, user);

        await this._handleFollowedEffect(data, options);

        return await this._handleImmediateScripts(data, options, user);
    }

    async _onDelete(options, user)
    {
        await super._onDelete(options, user);
        await this.deleteCreatedItems();
        await this._handleFollowedEffectDeletion();
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
            await this.parent.runScripts("updateDocument", {data, options, user});
        }
    }

    async _onCreate(data, options, user)
    {
        await super._onCreate(data, options, user);

        // If an owned effect is created, run parent update scripts
        if (this.parent)
        {
            await this.parent.runScripts("updateDocument", {data, options, user});
        }
    }

    //#region Creation Handling

    async _handleImmediateScripts(data, options, user)
    {
        let run = false;
        // Effect is direct parent, it's always applied to an actor, so run scripts
        if (this.parent?.documentName == "Actor")
        {
            run = true;
        }
        // If effect is grandchild, only run scripts if the effect should apply to the actor
        else if (this.parent?.documentName == "Item" && this.parent?.parent?.documentName == "Actor" && this.transfer)
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
                await Promise.all(scripts.map(s => s.execute({data, options, user})));
                return !scripts.every(s => s.options.immediate?.deleteEffect);
            }
            // If all scripts agree to delete the effect, return false (to prevent creation);
        }
    }

    async _handleEffectPrevention()
    {
        if (this.applicationData.options.avoidTest.prevention)
        {
            return this.resistEffect();
        }
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
            this.parent?.addCondition(this.key, {type : this.flags.impmal?.type, origin: this.origin, flags : this.flags});
            return true;
        }
    }

    async _handleFollowedEffect(data, options)
    {
        if (this.parent?.documentName == "Actor" && this.applicationData.options.zoneType == "follow")
        {
            let drawing = this.parent.currentZone[0];
            if (drawing)
            {
                let zoneEffects = foundry.utils.deepClone(drawing.document.flags.impmal?.effects || []);
                this.updateSource({"flags.impmal.following" : this.parent.getActiveTokens()[0]?.document?.uuid});
                zoneEffects.push(this.toObject());

                // keep ID lets us remove it from the drawing when the source is removed, see _handleFollowedEffectDeletion
                options.keepId = true;
                await SocketHandlers.executeOnOwner(drawing.document, "updateDrawing", {uuid: drawing.document.uuid, data : {flags : {impmal: {effects : zoneEffects}}}});
            }
        }
    }

    async _handleFollowedEffectDeletion()
    {
        if (this.parent.documentName == "Actor" && this.applicationData.options.zoneType == "follow")
        {
            let drawing = this.parent.currentZone[0];
            if (drawing)
            {
                let zoneEffects = foundry.utils.deepClone(drawing.document.flags.impmal?.effects || []);
                zoneEffects = zoneEffects.filter(i => i._id != this.id);
                await SocketHandlers.executeOnOwner(drawing.document, "updateDrawing", {uuid: drawing.document.uuid, data : {flags : {impmal: {effects : zoneEffects}}}});
            }
        }
    }


    /**
     * There is a need to support applying effects TO items, but I don't like the idea of actually
     * adding the document to the item, as it would not work with duration handling modules and 
     * would need a workaround to show the icon on a Token. Instead, when an Item type Active Effect
     * is applied, keep it on the actor, but keep a reference to the item(s) being modified (if none, modify all)
     * 
     */
    async _handleItemApplication()
    {
        let applicationData = this.applicationData;
        if (applicationData.options.documentType == "Item" && this.parent?.documentName == "Actor")
        {
            let items = [];
            let filter = this.filterScript;

            // If this effect specifies a filter, narrow down the items according to it
            if (filter)
            {
                items = this.parent.items.contents.filter(i => filter.execute(i)); // Ids of items being affected. If empty, affect all
            }

            // If this effect specifies a prompt, create an item dialog prompt to select the items
            if (applicationData.options.prompt)
            {
                items = await DocumentChoice.create(items, "unlimited");
            }


            this.updateSource({"flags.impmal.itemTargets" : items.map(i => i.id)});
        }
    }

    async _handleFilter()
    {
        let applicationData = this.applicationData;
        let filter = this.filterScript;
        if (!filter)
        {
            return;
        }

        if (applicationData.options.documentType == "Item" && this.parent?.documentName == "Actor")
        {
            return; // See above, _handleItemApplication
        }


        if (this.parent)
        {
            return filter.execute(this.parent);
        }
    }


    async resistEffect()
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
        let options = {title : {append : " - " + this.name}, context: {resist : [this.key].concat(this.sourceTest?.item?.type || []), resistingTest : this.sourceTest}};
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

        if (!applicationData.options.avoidTest.reversed)
        {
            // If the avoid test is marked as opposed, it has to win, not just succeed
            if (applicationData.options.avoidTest.opposed && this.getFlag("impmal", "sourceTest"))
            {
                return test.result.SL > this.getFlag("impmal", "sourceTest").result?.SL;
            }
            else 
            {
                return test.succeeded;
            }
        }
        else  // Reversed - Failure removes the effect
        {
            // If the avoid test is marked as opposed, it has to win, not just succeed
            if (applicationData.options.avoidTest.opposed && this.getFlag("impmal", "sourceTest"))
            {
                return test.result.SL < this.getFlag("impmal", "sourceTest").result?.SL;
            }
            else 
            {
                return !test.succeeded;
            }
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

        if (this.parent?.documentName == "Item")
        {
            this.transfer = this.determineTransfer();
        }
    }

    determineTransfer()
    {
        let application = this.applicationData;

        let allowed = (application.type == "document" && application.options.documentType == "Actor") || (application.type == "zone" && application.options.selfZone);

        if (this.parent.documentName == "Item")
        {
            allowed = allowed && this.item.system.shouldTransferEffect(this);
        }

        // if (this.parent.type == "talent")
        // {
        //     // Talents may need to be taken multiple times before an effect should be transfered
        //     let talentAllowed = this.parent.system.allowEffect(this);
        //     if (!talentAllowed)
        //     {
        //         return false;
        //     }
        // }
        
        return allowed;
    }

    // To be applied, some data needs to be changed
    // Convert type to document, as applying should always affect the document being applied
    // Set the origin as the actor's uuid
    // convert name to status so it shows up on the token
    convertToApplied()
    {
        let effect = this.toObject();
        effect.flags.impmal.applicationData.type = "document";
        effect.origin = this.actor?.uuid;
        effect.statuses = [this.key || effect.name.slugify()]; // this.key is prioritized if it's a condition, we don't want ablaze-(minor) as the key, just ablaze

        // When transferred to another actor, effects lose their reference to the item it was in
        // So if a effect pulls its avoid test from the item data, it can't, so place it manually
        if (this.applicationData.options.avoidTest.value == "item")
        {
            effect.flags.impmal.applicationData.options.avoidTest.value = "custom";
            mergeObject(effect.flags.impmal.applicationData.options.avoidTest, this.item?.getTestData() || {});
        }

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

    get manualScripts()
    {
        return this.scripts.filter(i => i.trigger == "manual");
    }

    get filterScript()
    {
        if (this.applicationData.options.filter)
        {
            try 
            {
                return new ImpMalScript({string : this.applicationData.options.filter, label : `${this.name} Filter`}, ImpMalScript.createContext(this));
            }
            catch(e)
            {
                console.error("Error creating filter script: " + e);
                return null;
            }
        }
        else { return null; }
    }

    get item()
    {
        if (this.parent?.documentName == "Item")
        {
            return this.parent;
        }
        else
        {
            return undefined;
        }
    }

    get originDocument() 
    {
        return fromUuidSync(this.origin);
    }

    get actor()
    {
        if (this.parent?.documentName == "Item")
        {
            return this.parent.parent;
        }
        else if (this.parent?.documentName == "Actor")
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
        if (this.parent?.documentName == "Item")
        {
            return this.parent.name; // TODO: a lot to change here, account for origin
        }
        else if (this.getFlag("impmal", "fromZone"))
        {
            return fromUuidSync(this.getFlag("impmal", "fromZone"))?.text;
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

    get sourceTest() 
    {
        return this.getFlag("impmal", "sourceTest");
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
        let effects = foundry.utils.deepClone(game.impmal.config.conditions).concat(foundry.utils.deepClone(Object.values(game.impmal.config.zoneEffects)));

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
            createData.flags = {core : {overlay : true}};
        }
        if (!createData.duration)
        {
            createData.duration = {};
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

                // Zone Properties
                zoneType : "zone",
                selfZone : false,
                keep : false,
                traits : {},

                // Test Properties
                avoidTest : { 
                    value : "none",
                    opposed : false,
                    prevention : true,
                    reversed : false,
                    manual : false,
                    script : "",
                    difficulty : "",
                    characteristic : "",
                    skill : {
                        key : "",
                        specialisation : ""
                    }
                },

                // Other
                enableConditionScript : "",
                filter : "",
                prompt : false,
            }
        };
    }
}
