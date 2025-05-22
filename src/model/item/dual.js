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
            notes : new fields.HTMLField()
        });

        schema.character = new fields.SchemaField({
            notes : new fields.HTMLField()
        });

        return schema;
    }

    async summaryData()
    {
        let data = await super.summaryData();
        data.notes = this.character.notes;
        return data;
    }
}