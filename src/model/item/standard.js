import { BaseItemModel } from "./base";

export class StandardItemModel extends BaseItemModel
{

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.notes = new fields.SchemaField({
            player : new fields.StringField(),
            gm : new fields.StringField()
        });

        return schema;
    }
}