let fields = foundry.data.fields;


// Generic list of objects
export class DocumentReferenceModel extends foundry.abstracts.DataModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.id = new fields.StringField();
    }
}