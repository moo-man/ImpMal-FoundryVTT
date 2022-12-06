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
        schema.talents = new fields.EmbeddedDataField(TalentListModel);
        return schema;
    }

}


class TalentListModel extends DocumentListModel 
{
    
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.number = new fields.NumberField({min : 0});
        return schema;
    }
}