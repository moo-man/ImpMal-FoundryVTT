import { DocumentListModel, GroupedDocumentListModel } from "../shared/list";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class RoleModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.advances = new fields.SchemaField({
            value : new fields.NumberField(),
            skills : new fields.ArrayField(new fields.StringField()),
            spec : new fields.ArrayField(new fields.StringField())
        });

        schema.equipment = new fields.EmbeddedDataField(GroupedDocumentListModel);
        schema.talents = new fields.EmbeddedDataField(DocumentListModel);
        schema.talents.fields.number = new fields.NumberField({min : 0});
    }

}