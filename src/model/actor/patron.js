import { BaseActorModel } from "./base";
import { ActorInfluenceModel } from "./components/influence";
let fields = foundry.data.fields;

export class PatronModel extends BaseActorModel 
{
    static preventItemTypes = ["weapon", "augmetic", "ammo", "forceField", "modification", "origin", "power", "protection", "specialisation", "talent", "injury"];
    static singletonItemPaths = {"faction" : "faction", "duty" : "duty"};
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
            payOverride : new fields.NumberField(),
            gradeModifier : new fields.NumberField()
        });
        return schema;
    }

    _addModelProperties()
    {
        this.faction.relative = this.parent.items
        this.duty.relative = this.parent.items
    }

    computeBase()
    {
        super.computeBase();
        this.influence.initialize();
    }

    computeDerived()
    {
        super.computeDerived();

        this.computeGrade();
        this.influence.compute(Array.from(this.parent.allApplicableEffects()), this.parent.itemTypes, this.parent.type);
    }
    
    computeGrade()
    {
        let grades = Object.keys(game.impmal.config.paymentGrade);
        let currentGradeIndex = grades.findIndex(i => i == this.payment.grade);
        let modifiedGradeIndex = Math.clamped(0, grades.length, currentGradeIndex + this.payment.gradeModifier);
        this.payment.grade = grades[modifiedGradeIndex];
        this.payment.value = this.payment.payOverride || game.impmal.config.paymentAmount[this.payment.grade] || 0;
    }
}

