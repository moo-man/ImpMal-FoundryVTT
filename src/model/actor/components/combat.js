let fields = foundry.data.fields;

export class BaseCombatModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.size = new fields.StringField();
        schema.speed = new fields.StringField();
        schema.fly = new fields.StringField();
        schema.hitLocations = new fields.ObjectField();
        return schema;
    }

    initializeArmour()
    {
        for (let loc in this.hitLocations)
        {
            this.hitLocations[loc].armour = 0;
        }
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
                }
            }
        }
    }
}


export class CharacterCombatModel extends BaseCombatModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.superiority = new fields.NumberField();
        return schema;
    }
}

export class NPCCombatModel extends BaseCombatModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.resolve = new fields.NumberField();
        return schema;
    }
}
