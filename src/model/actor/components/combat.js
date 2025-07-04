let fields = foundry.data.fields;

export class StandardCombatModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.size = new fields.StringField();
        schema.speed = new fields.SchemaField({
            land : new fields.SchemaField({
                value : new fields.StringField({initial : "normal"}),
                modifier : new fields.NumberField({initial : 0}),
                notes : new fields.StringField()
            }),
            fly : new fields.SchemaField({
                value : new fields.StringField({initial : "none"}),
                modifier : new fields.NumberField({initial: 0}),
                notes : new fields.StringField()
            })
        });
        schema.hitLocations = new fields.ObjectField({initial: {
            head: {
                range: [1,1],
                label: "IMPMAL.Head",
                abbrev: "IMPMAL.HeadAbbrev"
              },
              leftArm: {
                range: [2,2],
                label: "IMPMAL.LeftArm",
                abbrev: "IMPMAL.LeftArmAbbrev"
              },
              rightArm: {
                range: [3,3],
                label: "IMPMAL.RightArm",
                abbrev: "IMPMAL.RightArmAbbrev"
              },
              leftLeg: {
                range: [4,4],
                label: "IMPMAL.LeftLeg",
                abbrev: "IMPMAL.LeftLegAbbrev"
              },
              rightLeg: {
                range: [5,5],
                label: "IMPMAL.RightLeg",
                abbrev: "IMPMAL.RightLegAbbrev"
              },
              body: {
                range: [6,10],
                label: "IMPMAL.Body",
                abbrev: "IMPMAL.BodyAbbrev"
              }
        }});
        schema.armourModifier = new fields.NumberField({initial : 0});
        schema.initiative = new fields.NumberField()
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
        if (this.parent.autoCalc.wounds)
        {
            this.wounds.max = 0;
        }
        if (this.parent.autoCalc.initiative)
        {
            this.initiative = 0;
        }

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
        if (this.parent.autoCalc.wounds)
        {
            this.wounds.autoCalc = true;
            this.wounds.max += 
            characteristics.str.bonus + 
            (2 * characteristics.tgh.bonus) + 
            characteristics.wil.bonus;
        }
    }

    computeCriticals(characteristics) 
    {
        if (this.parent.autoCalc.criticals)
        {
            this.criticals.autoCalc = true;
            this.criticals.max += characteristics.tgh.bonus;
        }
    }

    computeInitiative(characteristics) 
    {
        if (this.parent.autoCalc.initiative)
        {
            this.initiative += characteristics.per.bonus + characteristics.ag.bonus;
        }
    }

    computeSpeed(speed)
    {
        if (speed.value != "none")
        {
            const speeds = ["slow", "normal", "fast", "swift"];
            let speedIndex = speeds.indexOf(speed.value) + (speed.modifier || 0);
            speedIndex = Math.clamp(speedIndex, 0, 3);
            speed.value = speeds[speedIndex];
        }
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

    get speedDisplay()
    {
        let text = []
        let land = this.speed.land;
        let fly = this.speed.fly;
        let speeds = game.impmal.config.speeds;
        let landText = speeds[land.value];
        if (land.notes)
        {
            landText += "*"
        }
        text.push(landText);

        if (fly.value != "none")
        {
            let flyText = game.i18n.localize("IMPMAL.Fly");
            if (fly.value != land.value)
            {
                flyText += ` (${speeds[fly.value]})`;
            }
            if (fly.notes)
            {
                flyText += "*";
            }
            text.push(flyText);
        }
        return text.join(", ");
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
            this.armour.value += this.armourModifier
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