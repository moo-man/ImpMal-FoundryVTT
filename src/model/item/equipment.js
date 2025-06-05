import { EquipSlots } from "./components/equip-slots";
import { EquippableItemModel } from "./components/equippable";
import { TestDataModel } from "./components/test";
import { TraitListModel } from "./components/traits";
let fields = foundry.data.fields;


export class EquipmentModel extends EquippableItemModel
{
    static LOCALIZATION_PREFIXES = ["WH.Models.equipment"];
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.traits = new fields.EmbeddedDataField(TraitListModel);
        schema.test = new fields.EmbeddedDataField(TestDataModel);
        schema.uses = new fields.SchemaField({
            value : new fields.NumberField({initial : null, nullable : true}),
            max : new fields.NumberField({initial : null, nullable : true}),
            enabled : new fields.BooleanField({initial : false}),
        });
        schema.test = new fields.EmbeddedDataField(TestDataModel);
        schema.slots = new fields.EmbeddedDataField(EquipSlots);
        return schema;
    }

    computeBase() 
    {
        super.computeBase();
        this.traits.compute();
    }

    getOtherEffects()
    {
        return super.getOtherEffects().concat(Object.values(this.traits.traitEffects("protection")));
    }

    _addModelProperties()
    {
        if (this.parent.actor)
        {
            this.slots.relative = this.parent.actor.items;
            this.slots.list.forEach(i => i.relative = this.slots.relative);
        }
    }


    async summaryData()
    {
        let data = await super.summaryData();
        data.tags = data.tags.concat(this.traits.htmlArray);
        return data;
    }
}