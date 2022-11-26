let fields = foundry.data.fields;

export class InfluenceModel extends foundry.abstracts.DataModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.factions = new fields.ObjectField();
        return schema;
    }
}