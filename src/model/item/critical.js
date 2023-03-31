import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class CriticalModel extends StandardItemModel 
{
    allowedConditions = ["bleeding", "stunned", "blinded", "deafened", "incapacitated", "prone", "stunned"];
    transferEffects = true;
    
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        return schema;
    }

}