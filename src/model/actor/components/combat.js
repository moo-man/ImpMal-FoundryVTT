let fields = foundry.data.fields;

export class StandardCombatModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.size = new fields.StringField();
        schema.speed = new fields.SchemaField({
            land : new fields.SchemaField({
                value : new fields.StringField(),
                modifier : new fields.NumberField({default : 0})
            }),
            fly : new fields.SchemaField({
                value : new fields.StringField(),
                modifier : new fields.NumberField({default: 0})
            })
        });
        schema.hitLocations = new fields.ObjectField();
        schema.wounds = new fields.SchemaField({
            value : new fields.NumberField(),
            max : new fields.NumberField(),
        });
        schema.criticals = new fields.SchemaField({
            value : new fields.NumberField(),
            max : new fields.NumberField(),
        });
        return schema;
    }


    initialize() 
    {
        this.wounds.max = 0;
        this.initiative = 0;

        for (let loc in this.hitLocations)
        {
            this.hitLocations[loc].armour = 0;
            this.hitLocations[loc].field = null;
            this.hitLocations[loc].items = [];
        }
    }

    computeCombat(characteristics, items) 
    {
        this.computeWounds(characteristics);
        this.computeCriticals(characteristics);
        this.computeInitiative(characteristics);
        this.computeSpeed(this.speed.land);
        this.computeSpeed(this.speed.fly);
        this.computeArmour(items);
        this.computeForceField(items);
    }

    computeWounds(characteristics) 
    {
        this.wounds.max += 
            characteristics.str.bonus + 
            (2 * characteristics.tgh.bonus) + 
            characteristics.wil.bonus;
    }

    computeCriticals(characteristics) 
    {
        this.criticals.max += characteristics.tgh.bonus;
    }

    computeInitiative(characteristics) 
    {
        this.initiative += 
            characteristics.per.bonus + 
            characteristics.ag.bonus;
    }

    computeSpeed(speed)
    {
        const speeds = ["none", "slow", "normal", "fast", "swift"];
        let speedIndex = speeds.indexOf(speed.value) + (speed.modifier || 0);
        speedIndex = Math.clamped(speedIndex, 0, 3);
        speed.value = speeds[speedIndex];
    }


    computeArmour(items)
    {
        let protectionItems = items.protection.filter(i => i.system.isEquipped);
        for(let item of protectionItems)
        {
            for (let loc of item.system.locations.list)
            {
                if (this.hitLocations[loc])
                {
                    this.hitLocations[loc].armour += item.system.armour;
                    this.hitLocations[loc].items.push(item);
                }
            }
        }
    }

    computeForceField(items)
    {
        let forceField = items.forceField.filter(i => i.system.isEquipped)[0];
        if (forceField)
        {
            for (let loc in this.hitLocations)
            {
                this.hitLocations[loc].field = forceField;
            }
        }   
    }

    hitLocAt(number)
    {
        for (let loc in this.hitLocations)
        {
            if (number >= this.hitLocations[loc].range[0] && number <= this.hitLocations[loc].range[1])
            {
                return loc;
            }
        }
    }

    randomHitLoc()
    {
        return this.hitLocAt(Math.ceil(CONFIG.Dice.randomUniform() * 10));
    }
}


export class CharacterCombatModel extends StandardCombatModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.superiority = new fields.NumberField();
        return schema;
    }
}

export class NPCCombatModel extends StandardCombatModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.resolve = new fields.NumberField();
        schema.armour = new fields.SchemaField({
            formula : new fields.StringField(),
            value : new fields.NumberField({min : 0})
        });
        return schema;
    }

    // Add NPC static armour value to all locations
    computeArmour(items)
    {
        super.computeArmour(items);
        for (let loc in this.hitLocations)
        {
            if (this.hitLocations[loc])
            {
                this.hitLocations[loc].armour += (this.armour.value || 0);
            }
        }
    }
}
