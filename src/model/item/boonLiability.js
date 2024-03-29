import { TestDataModel } from "./components/test";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class BoonLiabilityModel extends StandardItemModel 
{
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


}