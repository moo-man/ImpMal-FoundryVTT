import { PhysicalItemModel } from "./components/physical";
import { TraitListModel } from "./components/traits";
let fields = foundry.data.fields;

export class ProtectionModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.traits = new fields.EmbeddedDataField(TraitListModel),
        schema.category = new fields.StringField();
        schema.armour = new fields.NumberField();
        schema.locations = new fields.ObjectField();
        schema.equipped = new fields.BooleanField();
        return schema;
    }
}