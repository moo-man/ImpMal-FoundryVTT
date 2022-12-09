import { DamageModel } from "./components/damage";
import { EquippableItemModel } from "./components/equippable";
import { TraitListModel } from "./components/traits";
let fields = foundry.data.fields;

export class WeaponModel extends EquippableItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.damage = new fields.EmbeddedDataField(DamageModel);
        schema.traits = new fields.EmbeddedDataField(TraitListModel);
        schema.attackType = new fields.StringField();
        schema.category = new fields.StringField();
        schema.spec = new fields.StringField();
        schema.range = new fields.StringField();
        schema.mag = new fields.NumberField();
        return schema;
    }


    /**
     *   Unlike other "equippable" items, weapons should not subtract encumbrance if it is equipped
     *   So redo the calculation
     */ 
    computeBase() 
    {
        super.computeBase();
        this.encumbrance.total = this.quantity * this.encumbrance.value;
    }
}