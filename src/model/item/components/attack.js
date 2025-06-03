import { DamageModel } from "./damage";
import { TestDataModel } from "./test";
import { TraitListModel } from "./traits";

let fields = foundry.data.fields;

export class AttackDataModel extends TestDataModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        delete schema.difficulty; // Attacks don't need to define difficulty
        schema.type = new fields.StringField();
        schema.damage = new fields.EmbeddedDataField(DamageModel);
        schema.range = new fields.StringField();
        schema.traits = new fields.EmbeddedDataField(TraitListModel);
        return schema;
    }

    computeBase() 
    {
        super.computeBase();
        this.traits.compute();
    }

    computeOwned(actor) 
    {
        this.damage.compute(actor);
        const characteristic = this.characteristic || this.type;
        const skill = actor.itemTypes.specialisation.find(i => i.name == this.attack.skill.specialisation) || this.attack.skill.key;
        if (skill instanceof Item)
        {
            this.target = skill.system.total;
        }
        else if (actor.system.skills[skill])
        {
            this.target = actor.system.skills[skill].total;
        }
        else 
        {
            this.target = actor.system.characteristics[characteristic]?.total || 0;
        }
    }

    get enabled()
    {
        return this.type;
    }

}