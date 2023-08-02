import { SingletonItemModel } from "../shared/singleton-item";
import { BaseActorModel } from "./base";
import { ActorInfluenceModel } from "./components/influence";
let fields = foundry.data.fields;

export class PatronModel extends BaseActorModel 
{
    static preventItemTypes = ["weapon", "augmetic", "ammo", "forceField", "modification", "origin", "power", "protection", "specialisation", "talent"];
    static singletonItemTypes = ["faction", "duty"];
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.duty = new fields.EmbeddedDataField(SingletonItemModel);
        schema.faction = new fields.EmbeddedDataField(SingletonItemModel);
        schema.influence =  new fields.EmbeddedDataField(ActorInfluenceModel);
        schema.motivation = new fields.StringField();
        schema.demeanor = new fields.StringField();
        schema.payment = new fields.SchemaField({
            grade : new fields.StringField(),
            override : new fields.NumberField()
        });
        return schema;
    }

    computeDerived(items)
    {
        super.computeDerived(items);
        this.duty.getDocument(items.all);
        this.faction.getDocument(items.all);
        this.influence.compute(Array.from(this.parent.allApplicableEffects()), items, this.parent.type);
    }

}

