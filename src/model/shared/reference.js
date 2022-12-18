let fields = foundry.data.fields;


// Generic list of objects
export class DocumentReferenceModel extends foundry.abstract.DataModel
{
    static defineSchema() 
    {
        let schema = {};
        schema.id = new fields.StringField();
        return schema;
    }

    getDocument(collection) 
    {
        this.document = collection.get(this.id);
    }
}