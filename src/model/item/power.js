import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class PowerModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.discipline = new fields.StringField();
        schema.rating = new fields.NumberField();
        schema.difficulty = new fields.StringField();
        schema.range = new fields.StringField();
        schema.target = new fields.StringField();
        schema.duration = new fields.StringField();
        schema.overt = new fields.BooleanField();
        return schema;
    }

}