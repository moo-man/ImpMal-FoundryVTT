import { AvailabilityDialog } from "../../../apps/test-dialog/availability-dialog";
import { AvailabilityTest } from "../../../system/tests/availability/availability-test";
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

    isPhysical() 
    {
        return true;
    }

    get isSlotted()
    {
        return this.parent.actor?.system.slots?.find(i => i.id == this.parent.id)?.source;
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

    async setupAvailabilityTest(world=null, availability=null, {roll=true}={})
    {
        availability = availability || this.availability;

        let dialogData = AvailabilityDialog.setupData({item : this.parent, availability, world});

        let setupData = await AvailabilityDialog.awaitSubmit(dialogData);

        let test = AvailabilityTest.fromData(setupData);
        if (roll)
        {
            await test.roll();
        }
        return test;
    }


    async summaryData()
    {
        let data = await super.summaryData();
        data.details.physical = `<div>${game.i18n.format("IMPMAL.ItemDisplayXSolars", {solars : this.cost})}</div> <div>${game.impmal.config.availability[this.availability]}</div> <div>${game.i18n.format("IMPMAL.ItemDisplayXEnc", {enc : this.encumbrance.value})}</div>`;
        return data;
    }
}