import { BaseActorModel } from "./base";
import { CharacteristicsModel } from "./components/characteristics";
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
        schema.combat = new fields.SchemaField({
            size : new fields.StringField(),
            speed : new fields.StringField(),
            fly : new fields.StringField()
            
        }),
        schema.wounds = new fields.SchemaField({
            value : new fields.NumberField(),
            max : new fields.NumberField(),
        });
        return schema;
    }


    computeBase() 
    {
        this.characteristics.computeTotals();
        this.characteristics.computeBonuses();
    }

    computeDerived() 
    {
        // Recompute bonuses as active effects may have changed it
        this.characteristics.computeTotals();
        this.characteristics.computeBonuses();
        this.skills.computeTotals();
        computeWounds();
        computeInitiative();
    }

    computeWounds() 
    {
        this.wounds.max = 
            this.characteristics.str.bonus + 
            (2 * this.characteristics.tgh.bonus) + 
            this.characteristics.wil.bonus;
    }

    computeInitiative() 
    {
        this.iniative = 
            this.characteristics.per.bonus + 
            this.characteristicsr.ag.bonus;
    }


}

