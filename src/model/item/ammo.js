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
        schema.range = new fields.StringField();
        return schema;
    }

    computeBase() 
    {
        super.computeBase();
        this.traits.compute();
    }

    summaryData()
    {
        let data = super.summaryData();
        data.details.item.damage = game.i18n.format("IMPMAL.ItemDisplayXDamage", {damage : this.damage});
        data.details.item.range = game.i18n.format("IMPMAL.ItemDisplayXRange", {range : this.range});
        data.details.item.usedWith = game.i18n.format("IMPMAL.ItemDisplayUsedWith", {usedWith : this.usedWith});
        return data;
    }

}