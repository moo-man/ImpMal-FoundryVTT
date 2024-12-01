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
        schema.armourModifier = new fields.NumberField({initial : 0});
        schema.wounds = new fields.SchemaField({
            value : new fields.NumberField({initial : 0, min : 0}),
            max : new fields.NumberField(),
        });
        schema.criticals = new fields.SchemaField({
            value : new fields.NumberField({initial : 0}),
            max : new fields.NumberField(),
        });
        schema.action = new fields.StringField({});
        return schema;
    }


    initialize() 
    {
        this.wounds.max = 0;
        this.initiative = 0;

        for (let loc in this.hitLocations)
        {
            this.hitLocations[loc].key = loc;
            this.hitLocations[loc].armour = 0;
            this.hitLocations[loc].damage = 0;
            this.hitLocations[loc].formula = "";
            this.hitLocations[loc].field = null;
            this.hitLocations[loc].items = [];
            this.hitLocations[loc].sources = [];
            this.hitLocations[loc].flak = false;
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
        const speeds = ["slow", "normal", "fast", "swift"];
        let speedIndex = speeds.indexOf(speed.value) + (speed.modifier || 0);
        speedIndex = Math.clamp(speedIndex, 0, 3);
        speed.value = speeds[speedIndex];
    }


    computeArmour(items)
    {
        for (let loc in this.hitLocations)
        {
            this.hitLocations[loc].armour += this.armourModifier; // TODO: Add active effect to source list (so it's displayed in the hit loc section)

            // Don't like this but whatever
            this.parent.parent.appliedEffects.forEach(e => 
            {
                e.changes.forEach(c => 
                {
                    if ([`system.combat.hitLocations.${loc}.armour`, `system.combat.armourModifier`].includes(c.key))
                    {
                        this.hitLocations[loc].sources.push({name : e.name, value : c.value});
                    }
                });
            });
        }
        
        let protectionItems = items.protection.filter(i => i.system.isEquipped);
        for(let item of protectionItems)
        {
            for (let loc of item.system.locations.list)
            {
                if (this.hitLocations[loc])
                {
                    let armourDamage = (item.system.damage[loc] || 0);
                    this.hitLocations[loc].damage += armourDamage;
                    this.hitLocations[loc].armour += (item.system.armour - armourDamage + (item.system.traits.has("mastercrafted") ? 2 : 0));
                    this.hitLocations[loc].items.push(item);

                    // item.system.traits.list.forEach(i => 
                    // {
                    //     let key = i.key;
                    //     let value = i.value;
                    //     if (this.hitlocations[loc].traits[key])
                    //     {
                    //         if (Number.isNumeric(value) && Number.isNumeric(this.hitlocations[loc].traits[key]))
                    //         {
                    //             this.hitLocations[loc].traits[key] += value;
                    //         }
                    //     }
                    //     else 
                    //     {
                    //         this.hitLocations[loc].traits[key] = value || true;
                    //     }
                    // });
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
        if (number == 0)
        {
            number = 10;
        }
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
            value : new fields.NumberField({min : 0}),
            useItems : new fields.BooleanField()
        });
        return schema;
    }

    // Add NPC static armour value to all locations
    computeArmour(items)
    {
        if (this.armour.useItems)
        {
            super.computeArmour(items);
        }
        else 
        {
            for (let loc in this.hitLocations)
            {
                if (this.hitLocations[loc])
                {
                    this.hitLocations[loc].armour += (this.armour.value || 0);
                    this.hitLocations[loc].formula = this.armour.formula;
                }
            }
        }
    }

    computeCriticals()
    {
        // Do not compute criticals, handled by computeRole()
    }
}