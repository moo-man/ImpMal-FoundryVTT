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
            state : new fields.NumberField({initial: 0, min: 0})
        });
        return schema;
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
        this.warp.threshold = this.characteristics.wil.bonus; // Put this in base so it's modifiable by effects

    }

    computeDerived(items) 
    {
        super.computeDerived(items);
        // Recompute bonuses as active effects may have changed it
        this.characteristics.computeTotals();
        this.characteristics.computeBonuses();
        this.skills.computeTotals(this.characteristics);
        this.skills.findSpecialisations(items.specialisation);
        this.computeEncumbrance(items);
        this.combat.computeCombat(this.characteristics, items);
        this.computeWarpState();
    }

    computeEncumbrance(items) 
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

    updateChecks()
    {
        //TODO: Check for dead effect if above critical wound threshold
    }

    
    preUpdateChecks(data)
    {
        // Prevent wounds from exceeding max
        if (data.system?.combat?.wounds?.value)
        {
            if (data.system.combat.wounds.value > this.combat.wounds.max)
            {
                data.system.combat.wounds.value = this.combat.wounds.max;
            }
        }
        return data;
    }

}

