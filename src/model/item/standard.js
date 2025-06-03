import { BaseItemModel } from "./base";
let fields = foundry.data.fields;

export class StandardItemModel extends BaseItemModel
{

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.notes = new fields.SchemaField({
            player : new fields.HTMLField(),
            gm : new fields.HTMLField()
        });

        return schema;
    }

    async useText(includeEffectButtons=false)
    {
        let enriched = {
            player : await foundry.applications.ux.TextEditor.enrichHTML(this.notes.player, {async: true, relativeTo: this.parent, secrets : false}),
            gm : await foundry.applications.ux.TextEditor.enrichHTML(this.notes.gm, {async: true, relativeTo: this.parent, secrets : false})
        }
        return await renderTemplate("systems/impmal/templates/partials/item-use.hbs", {noImage : this.parent.img == "icons/svg/item-bag.svg", enriched, item : this.parent, includeEffectButtons });
    }

    async summaryData()
    {
        let data = await super.summaryData();
        data.notes = await TextEditor.enrichHTML(this.notes.player, {async: true, relativeTo: this.parent});
        data.gmnotes = await TextEditor.enrichHTML(this.notes.gm, {async: true, relativeTo: this.parent});
        return data;
    }
}