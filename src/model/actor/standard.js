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

