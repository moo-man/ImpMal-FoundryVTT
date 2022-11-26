let fields = foundry.data.fields;


// Generic list of objects
export class ListModel extends foundry.abstracts.DataModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.list = new fields.ArrayField();
    }

    add(value)
    {
        return this.list.concat(value);
    }

    remove(index)
    {
        return this.list.slice(0, index).concat(this.list.slice(index+1));
    }
}


// List of objects that reference some embedded document on the parent
export class DocumentListModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.list = new fields.ArrayField(fields.SchemaField({
            id : ""
        }));
    }

    removeId(id) 
    {
        let index = this.list.findIndex(i => i.id == id);

        if (index != -1) {return this.remove(index);}
        else {return this.list;}
    }

    findDocuments(collection) 
    {
        this.list.forEach(i => i.document = collection.get(i.id));
    }
}