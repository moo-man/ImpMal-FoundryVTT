export class ImpMalEffect extends ActiveEffect
{

    async _preCreate(data, options, user)
    {
        await super._preCreate(data, options, user);
        if (this.parent.documentName == "Item")
        {
            this.updateSource({transfer : this.parent.system.transferEffects});
        }
    }

    get key () 
    {
        return this.getFlag("core", "statusId");
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

    get source()
    {
        let doc = fromUuidSync(this.origin);
        return doc?.name || doc?.text || "???";
    }

    // Computed effects mean flagged to know that they came from a calculation, notably encumbrance causing overburdened or restrained
    get isComputed()
    {
        return this.getFlag("impmal", "computed");
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
        createData["flags.core.statusId"] = effectData.id;
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
                effect.parent.addCondition(effect.flags.core.statusId, {type : effect.flags.core.type});
                return false;
            }
        }
    }
}
