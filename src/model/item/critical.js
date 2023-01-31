import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class CriticalModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        return schema;
    }

}