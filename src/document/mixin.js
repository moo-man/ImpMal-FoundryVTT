import ImpMalUtility from "../system/utility";
import { ImpMalEffect } from "./effect";

export default ImpMalDocumentMixin = (cls) => class extends cls 
{

    addCondition(key, type, mergeData={})
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

        let createData = ImpMalEffect.getCreateData(effectData);
        
        foundry.utils.mergeObject(createData, mergeData);


        // Replace minor with major if existing
        if (existing)
        {
            return existing.update(createData).then(e => 
            {
                this.runScripts("createCondition", e);
                if (e.parent.documentName == "Actor")
                {
                    e._displayScrollingStatus(true);
                }
                e.handleImmediateScripts({}, {}, game.user.id); // If a minor condition goes to major, run any immediate conditions for major
            });
        }
        else 
        {
            const cls = getDocumentClass("ActiveEffect");
            return cls.create(createData, {parent: this, condition: true}).then(e => // condition flag tells the creation flow that this has gone through addCondition
            {
                this.runScripts("createCondition", e);
            }); 
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
        return this.effects.find(e => e.key == key);
    }
};