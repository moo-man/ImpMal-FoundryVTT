import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class TalentModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.requirement = new fields.SchemaField({
            value : new fields.StringField()
        });
    }

}