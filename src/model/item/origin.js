import { ChoiceModel } from "../shared/choices";
import { DocumentListModel } from "../shared/list";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class OriginModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.equipment = new fields.EmbeddedDataField(DocumentListModel);
        schema.bonuses = new fields.EmbeddedDataField(ChoiceModel);
        return schema;
    }

}