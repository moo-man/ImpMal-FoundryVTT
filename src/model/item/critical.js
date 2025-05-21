import { LocationChoice } from "./components/location-choice";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class CriticalModel extends StandardItemModel 
{
    allowedConditions = ["bleeding", "stunned", "blinded", "deafened", "incapacitated", "prone", "stunned", "fatigued"];
    static LOCALIZATION_PREFIXES = ["WH.Models.critical"];
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        schema.location = new fields.EmbeddedDataField(LocationChoice); 
        return schema;
    }

    async _preCreate(data, options, user)
    {
        super._preCreate(data, options, user);
        if (this.parent.actor)
        {
            this.updateSource({"location.value" : await this.location.promptChoice(this.parent.actor)});
        }
    }
}