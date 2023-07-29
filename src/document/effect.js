import ImpMalScript from "../system/script";

export class ImpMalEffect extends ActiveEffect
{

    async _preCreate(data, options, user)
    {
        await super._preCreate(data, options, user);
    }

    prepareData() 
    {
        super.prepareData();

        this.scripts = this.scriptData.map(i => new ImpMalScript(i, ImpMalScript.createContext(this)));

        if (this.parent.documentName == "Item")
        {
            this.transfer = this.determineTransfer();
            if (this.transfer)
            {
                this.fromItem = true;
            }
        }
    }

    determineTransfer()
    {
        let application = this.applicationData;
        return application.type == "document" && application.options.documentType == "Actor";
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
        //     delete applicationData.options.test;
        //     delete applicationData.options.filters;
        //     delete applicationData.options.prompt;
        //     delete applicationData.options.consume;
        // }

        // if (applicationData.type == "damage")
        // {
        //     delete applicationData.options.test;

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

    /**
     * This function handles creation of new conditions on an actor
     * If an Item adds a Condition, prevent that condition from being added, and instead call `addCondition` 
     * This prevents the Condition from being removed when the item is removed, but more importantly
     * `addCondition` handles Minor conditions turning into Major if a second Minor is added.
     * 
     * @param {ImpMalEffect} effect Effect being created
     * @returns 
     */
    static _handleConditionCreation(effect)
    {
        if (effect.parent?.documentName == "Actor")
        {
            if (effect.isCondition && effect.origin) // If the condition comes from a source such as item, prevent it and go through `addCondition`
            {
                effect.parent.addCondition(effect.key, {type : effect.flags.impmal?.type});
                return false;
            }
        }
    }

    static _defaultApplicationData() 
    {
        return {
            type : "document",
            options : {
                documentType : "Actor",
                test : { 
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
                consume : false
            }
        };
    }
}
