import { ImpMalEffect } from "./effect";

export default ImpMalDocumentMixin = (cls) => class extends cls 
{

    async _preCreate(data, options, user) 
    {
        await super._preCreate(data, options, user);
        this.updateSource(this.system.preCreateData(data));
    }

    async _preUpdate(data, options, user) 
    {
        await super._preUpdate(data, options, user);
        this.system.preUpdateChecks(data);
    }

    async _onUpdate(data, options, user)
    {
        await super._onUpdate(data, options, user);
        this.update(this.system.updateChecks(data));
    }


    addCondition(key, {overlay=false, type}={})
    {
        let existing = this.hasCondition(key);
        let effectData;
        if (existing)
        {
            if (existing.isMinor)
            {
                effectData = ImpMalEffect.findEffect(key, "major"); // Escalate to major if existing is minor
            }
            else 
            {
                return; // If already has condition or condition is major already, don't do anything
            }
        }
        else if (!existing)
        {
            effectData = ImpMalEffect.findEffect(key, type); // defaults to minor
        }

        let createData = ImpMalEffect.getCreateData(effectData, overlay);


        // Replace minor with major if existing
        if (existing)
        {
            return existing.update(createData).then(e => 
            {
                if (e.parent.documentName == "Actor")
                {
                    e._displayScrollingStatus(true);
                }
            });
        }
        else 
        {
            const cls = getDocumentClass("ActiveEffect");
            return cls.create(createData, {parent: this});
        }
    }

    removeCondition(key)
    {
        let existing = this.hasCondition(key);
        if (existing)
        {
            if (!existing.isMajor)
            {
                return existing.delete();
            }
            else if (existing.isMajor)
            {
                let effectData = ImpMalEffect.findEffect(key, "minor");
                let createData = ImpMalEffect.getCreateData(effectData);
                // Convert major to minor effect
                if (existing.parent.documentName == "Actor")
                {
                    existing._displayScrollingStatus();
                }
                return existing.update(createData);
            }
        }
    }

    hasCondition(key)
    {
        return this.effects.find(e => e.conditionKey == key);
    }
};