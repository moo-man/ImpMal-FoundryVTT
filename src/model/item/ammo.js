import { PhysicalItemModel } from "./components/physical";
import { TraitListModel } from "./components/traits";
let fields = foundry.data.fields;

export class AmmoModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.traits = new fields.EmbeddedDataField(TraitListModel);
        schema.usedWith = new fields.StringField();
        schema.damage = new fields.NumberField();
        return schema;
    }

}