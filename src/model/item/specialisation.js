import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class SpecialisationModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.skill = new fields.StringField();
        schema.advances = new fields.NumberField({min: 0, initial: 0});
        schema.restricted = new fields.BooleanField();
        return schema;
    }


    get total() 
    {
        return this.parent.actor?.system.skills[this.skill]?.total + (5 * this.advances);
    }

    getTotalFor(characteristic, actor)
    {
        return actor.system.skills[this.skill].getTotalFor(characteristic, actor) + (5 * this.advances);
    }

    get skillNameAndTotal() 
    {
        return `${this.skillName} ${this.total}`;
    }

    get skillName() 
    {
        return `${game.impmal.config.skills[this.skill]} (${this.parent.name})`;
    }

    async summaryData()
    {
        let data = await super.summaryData();
        data.tags = data.tags.concat(game.impmal.config.skills[this.skill]);
        return data;
    }

}