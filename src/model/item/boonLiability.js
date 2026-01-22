import { TestDataModel } from "./components/test";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class BoonLiabilityModel extends StandardItemModel 
{
    static LOCALIZATION_PREFIXES = ["WH.Models.boonLiability"];
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        schema.visible = new fields.BooleanField();
        schema.oneUse = new fields.BooleanField();
        schema.used = new fields.BooleanField();
        schema.test = new fields.EmbeddedDataField(TestDataModel);
        return schema;
    }

    async summaryData()
    {
        let data = await super.summaryData();
        data.tags.push(game.i18n.localize(this.category == "boon" ? "IMPMAL.Boon" : "IMPMAL.Liability"));
        return data;
    }

    async toEmbed(config, options)
    {

        let html = `
            <h5>@UUID[${this.parent.uuid}]{${config.label || this.parent.name}}</h5>
            ${this.notes.player}
            ${game.user.isGM ? this.notes.gm : ""}
        `;


        let div = document.createElement("div");
        div.style = config.style;
        div.innerHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(html, {relativeTo : this.parent, async: true, secrets : options.secrets});
        return div;
    }

}