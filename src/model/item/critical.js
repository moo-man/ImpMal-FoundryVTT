import { LocationChoice } from "./components/location-choice";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class CriticalModel extends StandardItemModel 
{
    allowedConditions = ["bleeding", "stunned", "blinded", "deafened", "incapacitated", "prone", "stunned", "fatigued"];
    allowedEffectApplications = ["document"];
    effectApplicationOptions = {documentType : "Actor"};
    
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        schema.location = new fields.EmbeddedDataField(LocationChoice); 
        return schema;
    }

    async preCreateData(data, options, user)
    {
        super.preCreateData(data, options, user);
        if (this.parent.actor)
        {
            return {"system.location.value" : await this.location.promptChoice(this.parent.actor)};
        }
        else 
        {
            return {};
        }
    }
}