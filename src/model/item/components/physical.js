import { StandardItemModel } from "../standard";

let fields = foundry.data.fields;

export class PhysicalItemModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.encumbrance = new fields.NumberField({min: 0});
        schema.cost = new fields.NumberField({min: 0});
        schema.availability = new fields.StringField({});

        return schema;
    }
}