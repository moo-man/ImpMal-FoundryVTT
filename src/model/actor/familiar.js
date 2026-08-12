import { NPCModel } from "./npc";

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
    schema.handler = new fields.EmbeddedDataField(DocumentReferenceListModel);
    return schema;
  }
}