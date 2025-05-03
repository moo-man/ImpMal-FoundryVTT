let fields = foundry.data.fields;

export class ActorInfluenceModel extends foundry.abstract.DataModel
{
    static defineSchema() 
    {
        let schema = {};
        schema.factions = new fields.ObjectField(); // {"adeptus-mechanicus : {name : "Adeptus Mechanices", sources : [{value: 1, reason : ""}] modifier : 0, effects : [], items : [], notes : "", hidden : false (patron only)}}
        schema.usePatron = new fields.BooleanField({initial: false});
        return schema;
    }

    initialize() 
    {
        this._initializeFactions();
    }

    compute(effects, items, type, patronInfluence)
    {
        this._findInfluenceItems(items, type);
        this._findInfluenceEffects(effects, "system.influence"); // Can assume this is the path currently
        
        for(let f in this.factions)
        {
            let faction = this.factions[f];
            faction.total = faction.sources.reduce((prev, current) => prev += current.value, 0) + faction.items.reduce((prev, current) => prev += current.value, 0) + (faction.modifier || 0);
        }

        this._computePatron(patronInfluence);
    }

    _initializeFactions()
    {
        for(let f in this.factions)
        {
            let faction = this.factions[f];
            faction.effects = [];
            faction.items = [];
            faction.modifier = 0;
        }
    }

    _findInfluenceEffects(effects, path)
    {
        effects.filter(e => !e.disabled).forEach(effect => 
        {
            let changes = effect.changes.filter(i => i.key.includes(path));
            changes.forEach(change => 
            {
                let splitKey = change.key.split(".");
                // Effects modify influence with `<faction>.modifier` so look for faction name right before modifier
                if (splitKey[splitKey.length - 1] == "modifier")
                {
                    let faction = splitKey[splitKey.length - 2];
                    this._fillMissingFaction(faction);
                    this.factions[faction].effects.push({value : change.value, reason : effect.name});
                }
            });
        });
    }

    _findInfluenceItems(items, type)
    {
        items.faction.concat(items.duty).forEach(item => 
        {
            for(let faction in item.system[type].influence.factions)
            {
                let factionData = item.system[type].influence.factions[faction];
                this._fillMissingFaction(faction, factionData.name);
                this.factions[faction].items.push({value : factionData.value, reason : item.name });
                // this.factions[faction].total += factionData.value; // I wish I could put this in `compute` but this will have to do for now
            }
        });
    }

    /**
     * If an effect or item adds influence to a faction that isn't on an Actor, create it here
     * 
     * @param {String} key Faction Key
     */
    _fillMissingFaction(key, name)
    {
        // Look for name specifically, otherwise form input causes {notes : ""} (the only input on the sheet) to be saved as the faction data
        if (!this.factions[key]?.name)
        {
            this.factions[key] = 
            {
                name : name || game.impmal.config.factions[key] || key,
                modifier : this.factions[key]?.modifier || 0,
                total : 0,
                sources : this.factions[key]?.sources || [],
                items : [],
                effects : [],
                notes : this.factions[key]?.notes || ""
            };
        }
    }

    _computePatron(patronInfluence)
    {
        if (!patronInfluence || !this.usePatron)
        {
            return;
        }

        // If using patron influence, override any character influence IF the faction is visible
        for(let faction in patronInfluence.factions)
        {
            let replacementFaction = foundry.utils.deepClone(patronInfluence.factions[faction]);
            if (replacementFaction.hidden)
            {
                continue;
            }
            this.factions[faction] = {
                name : replacementFaction.name,
                patron : true,
                total : replacementFaction.total,
                sources : [{value : replacementFaction.total, reason : "Patron"}],
                items : [],
                effects: [],
                notes : replacementFaction.notes
            };
        }

    }


    createFaction(name) 
    {
        let factions = foundry.utils.deepClone(this.factions);

        // Only add if doesn't exist
        if (!factions[name.slugify()])
        {
            factions[name.slugify()] = {name, sources : [],  modifier : 0, notes : ""};
        }
        
        return {[`${this.schema.fieldPath}.factions`] : factions};
    }  

    toggleFactionVisibility(name, path) 
    {
        let factions = foundry.utils.deepClone(this.factions);

        if (!factions[name])
        {
            return {};
        }
        else 
        {
            factions[name].hidden = !factions[name].hidden;
        }
        
        return {[`${this.schema.fieldPath}.factions`] : factions};
    }  


    deleteFaction(name) 
    {
        return {[`${this.schema.fieldPath}.factions.-=${name}`] : null};
    }  

    
    addSource(faction, {value=0, reason=""}={})
    {
        let sources = foundry.utils.deepClone(this.factions[faction]?.sources);
        if (!faction || !sources)
        {
            return {};
        }
        sources.push({value, reason});

        let data = {sources};

        data.name = this.factions[faction].name; // Resave the name

        return {[`${this.schema.fieldPath}.factions.${faction}`] : data};
    }

    editSource(faction, index, data={})
    {
        let sources = foundry.utils.deepClone(this.factions[faction]?.sources);
        if (!faction || !sources)
        {
            return {};
        }
        foundry.utils.mergeObject(sources[index], data);

        return {[`${this.schema.fieldPath}.factions.${faction}.sources`] : sources};
    }

    deleteSource(faction, index)
    {
        let sources = foundry.utils.deepClone(this.factions[faction]?.sources);
        if (!faction || !sources)
        {
            return {};
        }
        sources.splice(index, 1);

        return {[`${this.schema.fieldPath}.factions.${faction}.sources`] : sources};
    }


    static migrateData(data)
    {
        for(let key in data.factions)
        {
            let faction = data.factions[key];
            if (Number.isNumeric(faction.value))
            {
                faction.sources = [{value : faction.value, reason : "Base"}];
                faction.modifier = 0;
                delete faction.value;
            }
        }
    }
}