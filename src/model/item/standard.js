import { BaseItemModel } from "./base";
let fields = foundry.data.fields;

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

    async summaryData()
    {
        let data = await super.summaryData();
        data.notes = await TextEditor.enrichHTML(this.notes.player, {async: true, relativeTo: this.parent});
        data.gmnotes = await TextEditor.enrichHTML(this.notes.gm, {async: true, relativeTo: this.parent});
        return data;
    }
}