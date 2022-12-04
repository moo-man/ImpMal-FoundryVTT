let fields = foundry.data.fields;

export class InfluenceModel extends foundry.abstract.DataModel
{
    static defineSchema() 
    {
        let schema = {};
        schema.factions = new fields.ObjectField();
        return schema;
    }
}