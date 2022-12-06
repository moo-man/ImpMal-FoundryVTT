import { InfluenceModel } from "../shared/influence";
import { DocumentListModel, GroupedDocumentListModel } from "../shared/list";
import { DualItemModel } from "./dual";
let fields = foundry.data.fields;

export class FactionModel extends DualItemModel 
{
    static defineSchema() 
    {
        // Patron Fields
        let schema = super.defineSchema();
        mergeObject(schema.patron.fields, {
            duty : new fields.EmbeddedDataField(DocumentListModel),
            influence : new fields.EmbeddedDataField(InfluenceModel)
        });


        // Character Fields
        mergeObject(schema.character.fields, {
            solars : new fields.NumberField(),
            influence : new fields.EmbeddedDataField(InfluenceModel),
            characteristics : new fields.SchemaField({
                base : new fields.SchemaField({
                    id : new fields.StringField()
                }),
                choices : new fields.ArrayField(new fields.ObjectField())
            }),
            advances : new fields.SchemaField({
                value : new fields.NumberField({min: 0}),
                skills : new fields.ArrayField(new fields.ObjectField())
            }),
            talents : new fields.EmbeddedDataField(DocumentListModel),
            equipment : new fields.EmbeddedDataField(GroupedDocumentListModel),
            duty : new fields.EmbeddedDataField(DocumentListModel),
        });
        return schema;
    }

}