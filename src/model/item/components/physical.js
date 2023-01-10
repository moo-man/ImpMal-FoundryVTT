import { StandardItemModel } from "../standard";

let fields = foundry.data.fields;

export class PhysicalItemModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.encumbrance = new fields.SchemaField({
            value : new fields.NumberField({min: 0})
        });
        schema.cost = new fields.NumberField({min: 0});
        schema.quantity = new fields.NumberField({min: 0});
        schema.availability = new fields.StringField({});

        return schema;
    }

    computeBase() 
    {
        super.computeBase();
        this.encumbrance.total = this.quantity * this.encumbrance.value;
    }


    increase(value=1)
    {
        return {"system.quantity" : this.quantity + value};
    }

    decrease(value=1)
    {
        return {"system.quantity" : this.quantity - value};
    }
}