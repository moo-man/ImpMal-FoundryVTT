import EnabledMixin from "./components/enabled";
import { AttackDataModel } from "./components/attack";
import { TestDataModel } from "./components/test";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class TraitModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.attack = new fields.EmbeddedDataField(EnabledMixin(AttackDataModel));
        schema.test = new fields.EmbeddedDataField(EnabledMixin(TestDataModel));
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
            this.attack.target = actor.system.characteristics[characteristic]?.total || 0;
        }
    }

    get attackData() 
    {
        return {
            specialisation : this.attack.label,
            skillTotal : this.attack.target,
            damage : this.attack.damage, 
            traits : this.attack.traits
        };
    }

    get isMelee()
    {
        return this.attack.type == "melee";
    }

    get isRanged()
    {
        return this.attack.type == "ranged";
    }

    summaryData()
    {
        let data = super.summaryData();
        let config = game.impmal.config;
        data.tags = data.tags.concat([
            game.i18n.format("IMPMAL.ItemDisplayXDamage", {damage : this.attack.damage.value}),
            config.weaponTypes[this.attack.type],
            config.ranges[this.attack.range],
            this.attack.traits.htmlArray]).filter(i => i);
        return data;
    }
}