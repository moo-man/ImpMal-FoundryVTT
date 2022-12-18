import { EquippableItemModel } from "./components/equippable";
import { TraitListModel } from "./components/traits";
let fields = foundry.data.fields;


export class EquipmentModel extends EquippableItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.traits = new fields.EmbeddedDataField(TraitListModel);
        return schema;
    }

    computeBase() 
    {
        super.computeBase();
        this.traits.compute();
    }
}