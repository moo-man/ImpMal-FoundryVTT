import { PhysicalItemModel } from "./components/physical";
let fields = foundry.data.fields;

export class EquipmentModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.equipped = new fields.BooleanField();
        return schema;
    }
}