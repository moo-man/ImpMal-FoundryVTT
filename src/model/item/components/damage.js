let fields = foundry.data.fields;

export class DamageModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.base = new fields.StringField({});
        schema.characteristic = new fields.StringField({});
        
        return schema;
    }

    compute(actor)
    {
        this.value = (Number(this.base) || 0) + (actor.system.characteristics[this.characteristic]?.bonus || 0);
    }
}