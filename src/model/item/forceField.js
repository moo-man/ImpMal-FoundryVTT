import { PhysicalItemModel } from "./components/physical";
import { TraitListModel } from "./components/traits";
let fields = foundry.data.fields;

export class ForceFieldModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.traits = new fields.EmbeddedDataField(TraitListModel),
        schema.protection = new fields.StringField();
        schema.overload = new fields.NumberField();
        schema.equipped = new fields.BooleanField();
        schema.force = new fields.BooleanField();
        return schema;
    }
}