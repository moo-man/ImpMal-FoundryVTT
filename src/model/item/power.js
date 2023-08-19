import { DamageModel } from "./components/damage";
import { TestDataModel } from "./components/test";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class PowerModel extends StandardItemModel
{
    static defineSchema()
    {
        let schema = super.defineSchema();
        schema.discipline = new fields.StringField();
        schema.minorSpecialisation = new fields.StringField(); // If minor, optionally apply specialisation
        schema.rating = new fields.NumberField();
        schema.difficulty = new fields.StringField();
        schema.range = new fields.StringField();
        schema.target = new fields.StringField();
        schema.duration = new fields.StringField();
        schema.damage = new fields.EmbeddedDataField(DamageModel);
        schema.overt = new fields.BooleanField();
        schema.opposed = new fields.EmbeddedDataField(TestDataModel),
        schema.xp = new fields.NumberField({initial : 0, min: 0});
        return schema;
    }

    getSkill(actor)
    {
        let skill = "psychic";
        let skillObject = actor.system.skills[skill];
        let discipline = this.discipline == "minor" ? this.minorSpecialisation : this.discipline;
        let skillItem = skillObject.specialisations.find(i => i.name == game.impmal.config.disciplines[discipline]);

        return skillItem ?? skill;
    }

    computeDerived()
    {
        super.computeDerived();
        if (this.discipline == "minor")
        {
            this.xp = 60;
        }
        else
        {
            this.xp = 100;
        }
    }

    computeOwnerDerived(actor)
    {
        this.skill = this.getSkill(actor);
        this.damage.compute(actor);
    }

    summaryData()
    {
        let data = super.summaryData();
        let config = game.impmal.config;
        data.tags = data.tags.concat([
            config[this.discipline],
            `WR: ${this.rating}`,
            config[this.range],
            this.target,
            config[this.duration],
            game.i18n.format("IMPMAL.ItemDisplayXDamage", {damage : this.damage.value})]);
        return data;
    }

}