import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class SkillSpecModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.skill = new fields.StringField();
        schema.advances = new fields.NumberField({min: 0, max: 4});
        schema.restricted = new fields.BooleanField();
        return schema;
    }

}