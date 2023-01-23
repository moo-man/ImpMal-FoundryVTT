import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class SpecialisationModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.skill = new fields.StringField();
        schema.advances = new fields.NumberField({min: 0, max: 4});
        schema.restricted = new fields.BooleanField();
        return schema;
    }


    computeOwnerDerived(actor) 
    {
        if (actor)
        {
            this.total = actor.system.skills[this.skill]?.total + (5 * this.advances);
        }
    }

    getTotalFor(characteristic, actor)
    {
        return actor.system.skills[this.skill].getTotalFor(characteristic, actor) + (5 * this.advances);
    }

}