import { ListModel } from "../../shared/list";

let fields = foundry.data.fields;

export class TraitListModel extends ListModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.list = new fields.ArrayField(new fields.SchemaField({
            key : new fields.StringField(),
            value : new fields.StringField({nullable : true})
        }));

        return schema;
    }

    has(key)
    {
        return this.list.find(i => i.key == key);
    }

    removeKey(key)
    {
        let index = this.list.findIndex(i => i.key == key);
        if (index != -1)
        {
            return super.remove(index);
        }
        else 
        {
            return this.list;
        }
    }

    add(traits)
    {

        if ((traits instanceof Array) == false)
        {
            // Don't add multiples
            traits = [traits].filter(i => i.key && !this.has(key));
        }


        return super.add(trait);
    }
}