import { AttackDataModel } from "./components/attack";
import { TestDataModel } from "./components/test";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class TraitModel extends StandardItemModel 
{
    static LOCALIZATION_PREFIXES = ["WH.Models.trait"];
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField({initial : "standard", choices : {"standard" : "IMPMAL.Standard", "vehicle" : "IMPMAL.Vehicle"}})
        schema.attack = new fields.EmbeddedDataField(AttackDataModel);
        schema.test = new fields.EmbeddedDataField(TestDataModel);
        schema.roll = new fields.SchemaField({
            enabled : new fields.BooleanField(),
            formula :  new fields.StringField(),
            label :  new fields.StringField()
        });

        schema.vehicle = new fields.SchemaField({
            maneuverable : new fields.NumberField({integer: true, initial: 0})
        })
        return schema;
    }

    async allowCreation(data, options, user)
    {
        let allowed = await super.allowCreation(data, options, user);

        let actor = this.parent.actor;
        if ((this.category == "vehicle" && actor.type != "vehicle")  || (this.category != "vehicle" && actor.type == "vehicle")) // can add character duties to npcs for quick stats
        {
            allowed = false;
            ui.notifications.error("IMPMAL.ErrorTraitType", {localize : true});
        }
        else 
        {
            allowed = true;
        }
        return allowed;
    }

    computeBase() 
    {
        super.computeBase();
        this.attack.damage.SL = true;
        this.attack.traits.compute();
    }

    computeOwned(actor) 
    {
        this.attack.damage.compute(actor);
        const characteristic = this.attack.characteristic || this.attack.type;
        const skill = actor.itemTypes.specialisation.find(i => i.name == this.attack.skill.specialisation) || this.attack.skill.key;
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
        return this.attack.enabled && this.attack.type == "melee";
    }

    get isRanged()
    {
        return this.attack.enabled && this.attack.type == "ranged";
    }

    async summaryData()
    {
        let data = await super.summaryData();
        let config = game.impmal.config;
        data.tags = data.tags.concat([
            game.i18n.format("IMPMAL.ItemDisplayXDamage", {damage : this.attack.damage.value}),
            config.weaponTypes[this.attack.type],
            config.ranges[this.attack.range],
            this.attack.traits.htmlArray]).filter(i => i);
        return data;
    }
}