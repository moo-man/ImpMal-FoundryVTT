import { DocumentListModel } from "../shared/list";
import { DocumentReferenceModel } from "../shared/reference";
import { DualItemModel } from "./dual";
let fields = foundry.data.fields;

export class DutyModel extends DualItemModel 
{
    static defineSchema() 
    {
        // Patron Fields
        let schema = super.defineSchema();

        schema.faction = new fields.EmbeddedDataField(DocumentReferenceModel);
        mergeObject(schema.patron.fields, {
            table : new fields.EmbeddedDataField(DocumentReferenceModel),
            boon : new fields.EmbeddedDataField(DocumentReferenceModel)
        });


        // Character Fields
        mergeObject(schema.character.fields, {
            equipment : new fields.EmbeddedDataField(DocumentListModel),
            characteristics : new fields.SchemaField({
                id : new fields.StringField()
            }),
        });
        return schema;
    }

}