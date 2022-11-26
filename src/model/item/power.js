import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class PowerModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.discipline = fields.StringField();
        schema.rating = fields.NumberField();
        schema.difficulty = fields.StringField();
        schema.range = fields.StringField();
        schema.target = fields.StringField();
        schema.duration = fields.StringField();
        schema.overt = fields.BooleanField();
    }

}