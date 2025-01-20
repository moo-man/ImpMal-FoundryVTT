export class RewardMessageModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let fields = foundry.data.fields;
        let schema = {};
        schema.xp = new fields.NumberField();
        schema.solars = new fields.StringField();
        schema.patron = new fields.EmbeddedDataField(DocumentReferenceModel)
        schema.reason = new fields.StringField();
        return schema;
    }
}