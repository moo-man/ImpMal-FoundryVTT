import ImpMalUtility from "../system/utility";
import { ImpMalEffect } from "./effect";

export default ImpMalDocumentMixin = (cls) => class extends cls 
{

    async _preCreate(data, options, user) 
    {
        if (data._id)
        {
            options.keepId = ImpMalUtility._keepID(data._id, this);
        }

        await super._preCreate(data, options, user);
        let allow = await this.system.allowCreation(data, options, user);
        if (!allow)
        {
            return false;
        }
        this.updateSource(await this.system.preCreateData(data, options));
        return allow;
    }

    async _preUpdate(data, options, user) 
    {
        await super._preUpdate(data, options, user);
        await this.system.preUpdateChecks(data, options);
        await Promise.all(this.runScripts("preUpdateDocument", {data, options, user}));
    }

    async _onUpdate(data, options, user)
    {
        await super._onUpdate(data, options, user);
        await this.update(await this.system.updateChecks(data, options));
        await Promise.all(this.runScripts("updateDocument", {data, options, user}));
    }

    async _onCreate(data, options, user)
    {
        await super._onCreate(data, options, user);
        await this.system.createChecks(data, options, user);
    }


    addCondition(key, {overlay=false, type, origin, duration={}, create=true, flags={}}={})
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
        mergeObject(createData.flags || {}, flags, {overwrite : false});
        createData.origin = origin;
        mergeObject(createData.duration, duration);


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
            if (create)
            {
                return cls.create(createData, {parent: this, condition: true}).then(e => // condition flag tells the creation flow that this has gone through addCondition
                {
                    this.runScripts("createCondition", e);
                }); 
            }
            else 
            {
                return createData;
            }
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

    runScripts(trigger, args)
    {
        let scripts = this.getScripts(trigger);

        let promises = [];

        for(let script of scripts)
        {
            if (script.async)
            {
                promises.push(script.execute(args));
            }
            else
            {
                script.execute(args);
            }
        }

        return promises;
    }


    // Assigns a property to all datamodels are their embedded models
    propagateDataModels(model, name, value)
    {
        if (model instanceof foundry.abstract.DataModel && !model[name])
        {
            Object.defineProperty(model, name, {
                value, 
                enumerable : false
            });
        }

        for(let property in model)
        {
            if (model[property] instanceof foundry.abstract.DataModel)
            {
                this.propagateDataModels(model[property], name, value);
            }
        }
    }
};