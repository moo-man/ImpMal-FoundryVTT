let fields = foundry.data.fields;

export class DamageModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.value = new fields.StringField({});
        schema.characteristic = new fields.StringField({});
        
        return schema;
    }
}