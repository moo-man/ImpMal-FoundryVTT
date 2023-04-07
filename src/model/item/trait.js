import { DamageModel } from "./components/damage";
import { TraitListModel } from "./components/traits";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class TraitModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.attack = new fields.SchemaField({
            enabled : new fields.BooleanField(),
            type :  new fields.StringField(),
            difficulty :  new fields.StringField(),
            characteristic :  new fields.StringField(),
            skill : new fields.SchemaField({
                specialisation :  new fields.StringField(),
                key :  new fields.StringField(),
            }),
            damage : new fields.EmbeddedDataField(DamageModel),
            range : new fields.StringField(),
            traits : new fields.EmbeddedDataField(TraitListModel)
        });
        schema.test = new fields.SchemaField({
            enabled : new fields.BooleanField(),
            target :  new fields.StringField(),
            difficulty :  new fields.StringField(),
            characteristic :  new fields.StringField(),
            skill : new fields.SchemaField({
                specialisation :  new fields.StringField(),
                key :  new fields.StringField(),
            }),
        });
        schema.roll = new fields.SchemaField({
            enabled : new fields.BooleanField(),
            formula :  new fields.StringField(),
            label :  new fields.StringField()
        });
        return schema;
    }

    computeBase() 
    {
        super.computeBase();
        this.attack.traits.compute();
    }

    computeOwnerDerived(actor) 
    {
        this.attack.damage.compute(actor);
        const characteristic = this.attack.characteristic || this.attack.type;
        const skill = actor.itemCategories.specialisation.find(i => i.name == this.attack.skill.specialisation) || this.attack.skill.key;
        if (skill instanceof Item)
        {
            this.attack.target = skill.system.total;
        }
        else if (actor.system.skills[skill])
        {
            this.attack.target = actor.system.skills[skill].total;
        }
        else 
        {
            this.attack.target = actor.system.characteristics[characteristic].total;
        }
    }

    testLabel(path)
    {
        let test = this[path];
        let config = game.impmal.config;
        
        let label = config.characteristics[test.characteristic];
        
        // Replace name from characteristic to skill if test specifies
        if (test.skill.key)
        {
            label = config.skills[test.skill.key];
        }
        // Add specialisation if available
        if (test.skill.specialisation)
        {
            label += ` (${test.skill.specialisation})`;
        }
        return label;
    }
}