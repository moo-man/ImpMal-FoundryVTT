import { ChoiceModel } from "../shared/choices";
import { DocumentListModel } from "../shared/list";
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
            // influence : new fields.EmbeddedDataField(InfluenceModel)
        });


        // Character Fields
        mergeObject(schema.character.fields, {
            characteristics : new fields.SchemaField({
                base : new fields.StringField(),
                choices : new fields.ArrayField(new fields.StringField())
            }),
            advances : new fields.SchemaField({
                value : new fields.NumberField({min: 0, initial: 5}),
                skills : new fields.ArrayField(new fields.StringField())
            }),
            // influence : new fields.EmbeddedDataField(InfluenceModel),
            talents : new fields.EmbeddedDataField(ChoiceModel),
            equipment : new fields.EmbeddedDataField(ChoiceModel),
            solars : new fields.NumberField(),
            duty : new fields.EmbeddedDataField(DocumentListModel),
        });
        return schema;
    }

}