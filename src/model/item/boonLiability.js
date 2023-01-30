import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class BoonLiabilityModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        schema.visible = new fields.BooleanField();
        return schema;
    }

}