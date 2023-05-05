import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class BoonLiabilityModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        schema.visible = new fields.BooleanField();
        return schema;
    }

    summaryData()
    {
        let data = super.summaryData();
        data.tags.push(game.i18n.localize(this.category == "boon" ? "IMPMAL.Boon" : "IMPMAL.Liability"));
        return data;
    }


}