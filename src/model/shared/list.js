import { DeferredDocumentModel, DocumentReferenceModel } from "./reference";

let fields = foundry.data.fields;


// Generic list of objects
export class ListModel extends foundry.abstract.DataModel
{
    defaultValue = undefined;

    static defineSchema() 
    {
        let schema = {};
        schema.list = new fields.ArrayField(new fields.ObjectField());
        return schema;
    }

    add(value)
    {
        return this.list.concat(value || this.defaultValue);
    }

    edit(index, value)
    {
        let list = duplicate(this.list);
        if (typeof value == "object")
        {
            mergeObject(list[index], value, {overwrite : true});
        }
        else if (typeof value == "string")
        {
            list[index] = value;
        }
        return list;
    }

    remove(index)
    {
        index = Number(index);
        return this.list.slice(0, index).concat(this.list.slice(index+1));
    }
}

// Generic list of objects
export class StringListModel extends ListModel
{
    defaultValue = "";

    static defineSchema() 
    {
        let schema = {};
        schema.list = new fields.ArrayField(new fields.StringField());
        return schema;
    }
}


// List of objects that reference some embedded document on the parent
export class DocumentListModel extends ListModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.list = new fields.ArrayField(new fields.EmbeddedDataField(DocumentReferenceModel));
        return schema;
    }

    removeId(id) 
    {
        let index = this.list.findIndex(i => i.id == id);

        if (index != -1) {return this.remove(index);}
        else {return this.list;}
    }

    findDocuments(collection) 
    {
        this.list.forEach(i => i.getDocument(collection));
        this.documents = this.list.map(i => i.document);
    }

    addDocument(document)
    {
        return this.add({
            id : document.id,
            name : document.name,
            type : document.documentName
        });
    }
}

// List of document references that could point to world items, or compendium items
// If ID is found in the world, use that, otherwise, search the compendium
export class DeferredDocumentListModel extends DocumentListModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.list = new fields.ArrayField(new fields.EmbeddedDataField(DeferredDocumentModel));
        return schema;
    }

    get(id)
    {
        return this.list.find(i => i.id == id).getDocument();
    }
    
    getDocuments()
    {
        return Promise.all(this.list.map(i => i.getDocument()));
    }

    get html() 
    {
        return this.list.map(i => `<a data-id=${i.id}>${i.name}</a>`).join(", ");
    }
}