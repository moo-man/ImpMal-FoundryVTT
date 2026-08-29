import { NPCModel } from "./npc";
import { XPModel } from "./components/xp";

export class FamiliarModel extends NPCModel
{
  static defineSchema()
  {
    let fields = foundry.data.fields;
    let schema = super.defineSchema();
    schema.familiarType = new fields.StringField();
    schema.cost = new fields.NumberField({min : 0});
    schema.instincts = new fields.SchemaField({
      combat : new fields.StringField(),
      preservation : new fields.StringField()
    })
    schema.augmetics = new fields.SchemaField({
      max : new fields.NumberField({initial: 0}),
      value : new fields.NumberField({initial: 0})
    });
    schema.handler = new fields.EmbeddedDataField(DocumentReferenceListModel);
    schema.xp = new fields.EmbeddedDataField(XPModel);
    return schema;
  }

  computeDerived()
  {
      super.computeDerived();
      this.augmetics.max += this.characteristics.tgh.bonus;
      this.augmetics.value = this.parent.itemTypes.augmetic.filter(i => !i.system.isSlotted && i.system.isEquipped).reduce((cost, augmetic) => cost + augmetic.system.augmeticCost, 0);

      this.xp.spent = XPModel.computeSpentFor(this.parent);
      this.xp.available = this.xp.total - this.xp.spent;
  }
}