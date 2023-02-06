import { BaseItemModel } from "./base";

let fields = foundry.data.fields;

/**
 * Represents an Item used by both Patrons and Characters/NPCs
 */
export class DualItemModel extends  BaseItemModel
{

    static defineSchema() 
    {
        let schema = {};
        schema.patron = new fields.SchemaField({
            notes : new fields.StringField()
        });

        schema.character = new fields.SchemaField({
            notes : new fields.StringField()
        });

        return schema;
    }


}