import EnabledMixin from "./components/enabled";
import { EquippableItemModel } from "./components/equippable";
import { TestDataModel } from "./components/test";
import { TraitListModel } from "./components/traits";
let fields = foundry.data.fields;


export class EquipmentModel extends EquippableItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.traits = new fields.EmbeddedDataField(TraitListModel);
        schema.test = new fields.EmbeddedDataField(TestDataModel);
        schema.uses = new fields.SchemaField({
            value : new fields.NumberField({initial : 0, nullable : true}),
            max : new fields.NumberField({initial : 0, nullable : true}),
            enabled : new fields.BooleanField({initial : false}),
        });
        schema.test = new fields.EmbeddedDataField(EnabledMixin(TestDataModel));
        return schema;
    }

    computeBase() 
    {
        super.computeBase();
        this.traits.compute();
    }

    summaryData()
    {
        let data = super.summaryData();
        data.tags = data.tags.concat(this.traits.htmlArray);
        return data;
    }
}