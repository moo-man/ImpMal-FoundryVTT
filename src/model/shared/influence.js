let fields = foundry.data.fields;

export class InfluenceModel extends foundry.abstract.DataModel
{
    static defineSchema() 
    {
        let schema = {};
        schema.factions = new fields.ObjectField();
        return schema;
    }

    createFaction(name) 
    {
        let factions = duplicate(this.factions);

        // Only add if doesn't exist
        if (!factions[name])
        {
            factions[name.slugify()] = {name, value : 0, notes : ""};
        }
        
        return {factions};
    }  

    deleteFaction(name) 
    {
        return {[`system.influence.factions.-=${name}`] : null};
    }  
}