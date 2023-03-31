import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class CorruptionModel extends StandardItemModel 
{
    transferEffects = true;

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        return schema;
    }

}