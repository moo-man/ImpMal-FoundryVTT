let fields = foundry.data.fields;


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
        if (collection instanceof Collection)
        {
            this.document = collection.get(this.id);
        }
        else if (collection instanceof Array)
        {
            this.document = collection.find(i => i.id == this.id);
        }
        else 
        {
            this.document = game.impmal.utility.findId(this.id);
        }
    }
}

export class DeferredDocumentModel extends DocumentReferenceModel
{
    static defineSchema() 
    {
        let schema = {};
        schema.id = new fields.StringField();
        schema.name = new fields.StringField();
        schema.type = new fields.StringField();
        return schema;
    }

    getDocument()
    {
        return game.impmal.utility.findId(this.id);
    }

    set(document)
    {
        return {
            id : document.id,
            name : document.name,
            type : document.documentName
        };
    }

    unset()
    {
        return {
            id : "",
            name : "",
            type : ""
        };
    }
}