let fields = foundry.data.fields;

export class ItemInfluenceModel extends foundry.abstract.DataModel
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
        if (!factions[name.slugify()])
        {
            factions[name.slugify()] = {name, value : 0};
        }
        
        return {[`${this.schema.fieldPath}.factions`] : factions};
    }  

    deleteFaction(name) 
    {
        return {[`${this.schema.fieldPath}.factions.-=${name}`] : null};
    }  
}