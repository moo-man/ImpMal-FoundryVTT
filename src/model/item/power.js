import { DamageModel } from "./components/damage";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class PowerModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.discipline = new fields.StringField();
        schema.rating = new fields.NumberField();
        schema.difficulty = new fields.StringField();
        schema.range = new fields.StringField();
        schema.target = new fields.StringField();
        schema.duration = new fields.StringField();
        schema.damage = new fields.EmbeddedDataField(DamageModel);
        schema.overt = new fields.BooleanField();
        schema.opposed = new fields.SchemaField({
            difficulty :  new fields.StringField(),
            characteristic :  new fields.StringField(),
            skill : new fields.SchemaField({
                specialisation :  new fields.StringField(),
                key :  new fields.StringField(),
            }),
        });
        return schema;
    }
    
    getSkill(actor)
    {
        let skill = "psychic";
        let skillObject = actor.system.skills[skill];
        let skillItem = skillObject.specialisations.find(i => i.name == game.impmal.config.disciplines[this.discipline]);

        return skillItem ?? skill;
    }

    computeOwnerDerived(actor) 
    {
        this.skill = this.getSkill(actor);
        this.damage.compute(actor);
    }

    get validOpposed()
    {
        let opposed = this.opposed;
        return opposed.difficulty && (opposed.characteristic || opposed.skill);
    }

    get opposedLabel()
    {
        return this.testLabel("opposed");
    }

}