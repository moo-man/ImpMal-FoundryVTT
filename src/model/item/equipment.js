import { EquippableItemModel } from "./components/equippable";

export class EquipmentModel extends EquippableItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        return schema;
    }
}