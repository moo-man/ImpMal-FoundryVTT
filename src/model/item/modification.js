import { PhysicalItemModel } from "./components/physical";
let fields = foundry.data.fields;

export class ModificationModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        schema.usedWith = new fields.StringField();
    }
}