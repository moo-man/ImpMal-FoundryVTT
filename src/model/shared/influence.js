let fields = foundry.data.fields;

export class InfluenceModel extends foundry.abstract.DataModel
{
    static defineSchema() 
    {
        let schema = {};
        schema.factions = new fields.ObjectField(); // {"adeptus-mechanicus : {name : "Adeptus Mechanices", sources : [{value: 1, reason : ""}] modifier : 0, effects : [], notes : ""}}
        return schema;
    }

    compute(effects, path)
    {
        for(let f in this.factions)
        {
            let faction = this.factions[f];
            faction.effects = [];
            faction.total = faction.sources.reduce((prev, current) => prev += current.value, 0) + faction.modifier;
        }
        this._findInfluenceEffects(effects, path);
    }

    _findInfluenceEffects(effects, path)
    {
        effects.forEach(effect => 
        {
            let changes = effect.changes.filter(i => i.key.includes(path));
            changes.forEach(change => 
            {
                let splitKey = change.key.split(".");
                // Effects modify influence with `<faction>.modifier` so look for faction name right before modifier
                if (splitKey[splitKey.length - 1] == "modifier")
                {
                    let faction = splitKey[splitKey.length - 2];
                    this.factions[faction]?.effects.push({value : change.value, reason : effect.name});
                }
            });
        });
    }

    createFaction(name, path) 
    {
        let factions = duplicate(this.factions);

        // Only add if doesn't exist
        if (!factions[name])
        {
            factions[name.slugify()] = {name, sources : [],  modifier : 0, notes : ""};
        }
        
        return {[`${path}.factions`] : factions};
    }  

    deleteFaction(name, path) 
    {
        return {[`${path}.factions.-=${name}`] : null};
    }  

    
    addSource(faction, data={})
    {
        let sources = foundry.utils.deepClone(this.factions[faction]?.sources);
        if (!faction || !sources)
        {
            return {};
        }
        sources.push({value : data.value || 0, reason : data.reason || ""});

        return {[`factions.${faction}.sources`] : sources};
    }

    editSource(faction, index, data={})
    {
        let sources = foundry.utils.deepClone(this.factions[faction]?.sources);
        if (!faction || !sources)
        {
            return {};
        }
        mergeObject(sources[index], data);

        return {[`factions.${faction}.sources`] : sources};
    }

    deleteSource(faction, index)
    {
        let sources = foundry.utils.deepClone(this.factions[faction]?.sources);
        if (!faction || !sources)
        {
            return {};
        }
        sources.splice(index, 1);

        return {[`factions.${faction}.sources`] : sources};
    }


    static migrateData(data)
    {
        for(let key in data.factions)
        {
            let faction = data.factions[key];
            if (faction.value)
            {
                faction.sources = [{value : faction.value, reason : "Base"}];
                faction.modifier = 0;
                delete faction.value;
            }
        }
    }
}