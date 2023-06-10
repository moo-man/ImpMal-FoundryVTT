import { StandardItemModel } from "../standard";

let fields = foundry.data.fields;

export class PhysicalItemModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.encumbrance = new fields.SchemaField({
            value : new fields.NumberField({min: 0, initial: 0})
        });
        schema.cost = new fields.NumberField({min: 0, initial: 0});
        schema.quantity = new fields.NumberField({min: 0, initial: 1});
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


    summaryData()
    {
        let data = super.summaryData();
        data.details.physical = `<div>${game.i18n.format("IMPMAL.ItemDisplayXSolars", {solars : this.cost})}</div> <div>${game.impmal.config.availability[this.availability]}</div> <div>${game.i18n.format("IMPMAL.ItemDisplayXEnc", {enc : this.encumbrance.value})}</div>`;
        return data;
    }
}