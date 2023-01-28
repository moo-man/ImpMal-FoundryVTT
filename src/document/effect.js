export class ImpMalEffect extends ActiveEffect
{
    get conditionKey () 
    {
        return this.getFlag("core", "statusId");
    }

    get isCondition() 
    {
        return !!game.impmal.config.conditions.find(i =>i.id == this.conditionKey);
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

    static findEffect(key, type="minor")
    {
        let effects = foundry.utils.deepClone(game.impmal.config.conditions);

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
}