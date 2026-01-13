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
        return await foundry.applications.handlebars.renderTemplate("systems/impmal/templates/chat/rolls/item-use.hbs", {noImage : ["icons/svg/item-bag.svg", "modules/impmal-core/assets/icons/blank.webp"].includes(this.parent.img), enriched, item : this.parent, includeEffectButtons });
    }

    async summaryData()
    {
        let data = await super.summaryData();
        data.notes = await foundry.applications.ux.TextEditor.enrichHTML(this.notes.player, {async: true, relativeTo: this.parent});
        data.gmnotes = await foundry.applications.ux.TextEditor.enrichHTML(this.notes.gm, {async: true, relativeTo: this.parent});
        return data;
    }
}