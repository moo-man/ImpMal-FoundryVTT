import { BaseActorModel } from "./base";
import { CharacteristicsModel } from "./components/characteristics";
import { StandardCombatModel } from "./components/combat";
import { SkillsModel } from "./components/skills";
let fields = foundry.data.fields;

/**
 * Represents actors that have characteristics and skills
 * Encompasses player characters and NPCs
 */
export class StandardActorModel extends BaseActorModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.characteristics = new fields.EmbeddedDataField(CharacteristicsModel);
        schema.skills = new fields.EmbeddedDataField(SkillsModel);
        schema.combat = new fields.EmbeddedDataField(StandardCombatModel);
        schema.warp = new fields.SchemaField({
            charge : new fields.NumberField({min: 0}),
            state : new fields.NumberField({initial: 0, min: 0}),
            sustaining : new fields.EmbeddedDataField(DocumentReferenceListModel)
        });

        schema.autoCalc = new fields.SchemaField({
            wounds: new fields.BooleanField({initial : true, label : "IMPMAL.ActorConfig.AutoCalc.Wounds"}),
            criticals : new fields.BooleanField({initial : true, label : "IMPMAL.ActorConfig.AutoCalc.CriticalWounds"}),
            initiative : new fields.BooleanField({initial : true, label : "IMPMAL.ActorConfig.AutoCalc.Initiative"}),
        });
        return schema;
    }

    async _preUpdate(data, options, user)
    {
        await super._preUpdate(data, options, user);

        // Prevent wounds from exceeding max
        if (foundry.utils.hasProperty(data, "system.combat.wounds.value"))
        {
            if (data.system.combat.wounds.value > this.combat.wounds.max)
            {
                data.system.combat.wounds.value = this.combat.wounds.max;
            }

            options.deltaWounds = data.system.combat.wounds.value - this.combat.wounds.value;
        }
    }

    async _onUpdate(data, options, user)
    {
        await super._onUpdate(data, options, user);
        //TODO: Check for dead effect if above critical wound threshold

        if (options.deltaWounds)
        {
            if (options.deltaWounds > 0)
            {
                TokenHelpers.displayScrollingText("+" + options.deltaWounds, this.parent, {fill: "0xB31B1B"});
            }
            else if (options.deltaWounds < 0)
            {
                TokenHelpers.displayScrollingText(options.deltaWounds, this.parent, {fill: "0xB31B1B"});
            }
        }

        if (options.showActionText && data.system.combat.action)
        {
            TokenHelpers.displayScrollingText(game.impmal.config.actions[data.system.combat.action].label, this.parent);
        }
    }
    
    initialize() 
    {
        this.encumbrance = {};
        this.encumbrance.overburdened = 0;
        this.encumbrance.restrained = 0;
        this.encumbrance.value = 0;
        this.combat.initialize();
    }

    computeBase() 
    {
        super.computeBase();
        this.characteristics.computeTotals();
        this.characteristics.computeBonuses();
        this.combat.criticals.value = this.parent.itemTypes.critical.length;
        this.warp.threshold = this.characteristics.wil.bonus; // Put this in base so it's modifiable by effects
        if (this.warp.sustaining.list.length)
        {
            let minCharge = this.warp.sustaining.documents.reduce((sum, power) => sum + power?.system?.rating || 0, 0);
            if (this.warp.charge < minCharge)
            {
                    this.warp.charge = minCharge;
            }
        }

    }

    computeDerived() 
    {
        super.computeDerived();
        // Recompute bonuses as active effects may have changed it
        this.characteristics.computeTotals();
        this.characteristics.computeBonuses();
        this.runScripts("computeCharacteristics", this);
        this.skills.computeTotals(this.characteristics);
        this.skills.findSpecialisations(this.parent.itemTypes.specialisation);
        this.computeEncumbranceThresholds(this.parent.itemTypes);
        this.runScripts("computeEncumbrance", this);
        this.computeEncumbranceState();
        this.combat.computeCombat(this.characteristics, this.parent.itemTypes);
        this.runScripts("computeCombat", this);
        this.computeWarpState();
        this.runScripts("computeWarpState", this);
        this.vehicle = game.actors.find(v => v.type == "vehicle" && (v.system.actors.list.find(i => i.id == this.parent.id)));
    }

    computeEncumbranceThresholds(items) 
    {
        let list = [];
        let physicalTypes = Object.keys(game.template.Item).filter(i => game.template.Item[i].templates?.includes("physical"));
        
        for (let type in items)
        {
            if (physicalTypes.includes(type))
            {
                list = list.concat(items[type]);
            }
        }

        this.encumbrance.overburdened += this.characteristics.str.bonus + this.characteristics.tgh.bonus; 
        this.encumbrance.restrained += (this.characteristics.str.bonus + this.characteristics.tgh.bonus) * 2;
        this.encumbrance.value += list.reduce((acc, item) => acc += item.system.encumbrance.total, 0);
    }

    computeEncumbranceState()
    {
        if (this.encumbrance.value <= this.encumbrance.overburdened)
        {
            this.encumbrance.state = 0;
        }
        else if (this.encumbrance.value <= this.encumbrance.restrained)
        {
            this.encumbrance.state = 1;
        }
        else if (this.encumbrance.value > this.encumbrance.restrained)
        {
            this.encumbrance.state = 2;
        }
    }

    computeWarpState()
    {
        // State = 0: Charge <= Threshold
        // State = 1: Charge > Threshold and has not failed Psychic Mastery Test
        // State = 2: Charge > Threshold and has failed Psychic Mastery test, has not rolled Perils yet

        // State 1 and 2 cannot be "computed", State 0 can be computed 
        // So if state is 0 and charge > threshold, state should be 1 instead
        // State 1 -> 2 is determined via test results
        if (this.warp.charge > this.warp.threshold && this.warp.state == 0)
        {
            this.warp.state = 1;
        }
        if (this.warp.charge <= this.warp.threshold)
        {
            this.warp.state = 0;
        }
    }

    _checkEncumbranceEffects(actor)
    {
        let overburdened = actor.hasCondition("overburdened");
        let restrained = actor.hasCondition("restrained");
        let effect;

        if (actor.system.encumbrance.state == 0)
        {
            if (overburdened?.isComputed)
            {
                overburdened.delete();
            }
            if (restrained?.isComputed)
            {
                restrained.delete();
            }
        }

        else if (actor.system.encumbrance.state == 1)
        {
            if (!overburdened)
            {   
                effect = "overburdened";
            }

            if (restrained?.isComputed)
            {
                restrained.delete();
            }
        }
        else if (actor.system.encumbrance.state == 2)
        {
            if (!restrained)
            {   
                effect = "restrained";
            }
        }

        if (effect)
        {
            actor.addCondition(effect, null, {"system.computed" : true})
        }

    }

    _addModelProperties()
    {
        super._addModelProperties();
        this.warp.sustaining.relative = this.parent.items;
    }
}

