import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class TalentModel extends StandardItemModel 
{
    transferEffects = true;
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.requirement = new fields.SchemaField({
            value : new fields.StringField()
        });
        schema.xp = new fields.NumberField({initial : 100, min: 0});
        return schema;
    }

    computeDerived()
    {
        super.computeDerived();
        this.xp = 100;
    }

    summaryData()
    {
        let data = super.summaryData();
        data.details.item.requirement = `<strong>${game.i18n.localize("IMPMAL.Requirement")}</strong>: ${this.requirement.value}`;
        return data;
    }
}