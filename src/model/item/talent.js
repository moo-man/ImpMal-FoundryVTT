import ImpMalScript from "../../system/script";
import { TestDataModel } from "./components/test";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class TalentModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.requirement = new fields.SchemaField({
            value : new fields.StringField(),
            script : new fields.StringField()
        });
        schema.xp = new fields.NumberField({initial : 100, min: 0});
        schema.test = new fields.EmbeddedDataField(TestDataModel);
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

    allowCreation()
    {
        let allowed = super.allowCreation(this.parent);
        
        if (allowed && this.parent.actor && this.requirement.script)
        {
            let script = new ImpMalScript({string : this.requirement.script, label : "Talent Requirement"}, ImpMalScript.createContext(this.parent));
            allowed = script.execute() ? true : false; // Make sure it's boolified
            if (!allowed)
            {
                ui.notifications.error("Talent Requirement not met");
            }
        }
        return allowed;
    }
}