import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class CorruptionModel extends StandardItemModel 
{
    allowedEffectApplications = ["document"];
    effectApplicationOptions = {documentType : "Actor"};

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        return schema;
    }

    summaryData()
    {
        let data = super.summaryData();
        data.tags.push(game.impmal.config.corruptionType[this.category]);
        return data;
    }

}