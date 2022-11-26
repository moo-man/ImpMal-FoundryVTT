import { DamageModel } from "./components/damage";
import { PhysicalItemModel } from "./components/physical";
import { TraitListModel } from "./components/traits";
let fields = foundry.data.fields;

export class WeaponModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.damage = new fields.EmbeddedDataField(DamageModel);
        schema.traits = new fields.EmbeddedDataField(TraitListModel);
        schema.category = new fields.StringField();
        schema.spec = new fields.StringField();
        schema.range = new fields.StringField();
        schema.mag = new fields.NumberField();
        schema.equipped = new fields.BooleanField();
    }

}