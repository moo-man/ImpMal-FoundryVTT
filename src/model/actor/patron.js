import { InfluenceModel } from "../shared/influence";
import { BaseActorModel } from "./base";
let fields = foundry.data.fields;

export class PatronModel extends BaseActorModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.influence =  new fields.EmbeddedDataField(InfluenceModel);
        schema.motivation = new fields.StringField();
        schema.demeanor = new fields.StringField();
        schema.payment = new fields.SchemaField({
            grade : new fields.StringField(),
            override : new fields.NumberField()
        });
        return schema;
    }
}

