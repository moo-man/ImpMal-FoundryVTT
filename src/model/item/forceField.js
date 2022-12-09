import { EquippableItemModel } from "./components/equippable";
import { TraitListModel } from "./components/traits";
let fields = foundry.data.fields;

export class ForceFieldModel extends EquippableItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.traits = new fields.EmbeddedDataField(TraitListModel),
        schema.protection = new fields.StringField();
        schema.overload = new fields.NumberField();
        schema.force = new fields.BooleanField();
        return schema;
    }
}