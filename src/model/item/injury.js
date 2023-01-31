import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class InjuryModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        return schema;
    }

}