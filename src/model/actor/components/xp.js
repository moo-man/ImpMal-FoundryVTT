
let fields = foundry.data.fields;

export class XPModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.total = new fields.NumberField({initial : 0});
        schema.other = ListModel.createListModel(new fields.SchemaField({
            xp : new fields.NumberField({initial : 0}),
            description : new fields.StringField({})
        }));
        return schema;
    }

    static computeSpentFor(actor)
    {
        return this._computeCharacteristicXP(actor.system.characteristics) + 
            this._computeSkillXP(actor.system.skills) +
            this._computeSpecXP(actor.itemTypes.specialisation) + 
            this._computeTalentXP(actor.itemTypes.talent) +
            this._computePowerXP(actor.itemTypes.power) +
            this._computeOtherXP(actor.system.xp);
    }


    static _computeCharacteristicXP(characteristics)
    {
        let spent = 0;

        for(let ch in characteristics)
        {
            let characteristic = characteristics[ch];
            let advances = characteristic.advances;
            let starting = characteristic.starting;
            let total = advances + starting; // Can't use .total because it includes modifiers
            if (advances > 0)
            {
                for(let num = starting+1; num <= total; num++)
                {
                    spent += this.xpForValue(num, this.characteristicCosts);
                }
            }
            
        }
        return spent;
    }

    static _computeSkillXP(skills)
    {
        let spent = 0;
        for (let sk in skills)
        {
            spent += this.skillTotalCosts[skills[sk].advances] || 0;
        }
        return spent;
    }

    static _computeSpecXP(specs)
    {
        let spent = 0;
        for (let sp of specs)
        {
            spent += this.skillTotalCosts[sp.system.advances] || 0;
        }
        return spent;
    }

    static _computeTalentXP(talents)
    {
        return talents.reduce((prev, current) => prev += current.system.xp, 0);
    }

    static _computePowerXP(powers)
    {
        return powers.reduce((prev, current) => prev += current.system.xp, 0);
    }
    
    
    static _computeOtherXP(xp)
    {
        return xp.other.list.reduce((total, current) => total + (current.xp || 0), 0);
    }

    static xpForValue(value, costs)
    {
        let inRange = costs.find(i => i.range[0] <= value && i.range[1] >= value);
        if (inRange)
        {
            return inRange.cost;
        }
        else 
        {
            return 0;
        }
    }

    static characteristicCosts = [
        {range : [20, 25], cost : 20},
        {range : [26, 30], cost : 25},
        {range : [31, 35], cost : 30},
        {range : [36, 40], cost : 40},
        {range : [41, 45], cost : 60},
        {range : [46, 50], cost : 80},
        {range : [51, 55], cost : 110},
        {range : [56, 60], cost : 140},
        {range : [61, 65], cost : 180},
        {range : [66, 70], cost : 220},
        {range : [71, 75], cost : 270},
        {range : [76, 80], cost : 32},
    ];

    static skillTotalCosts = {
        1 : 50,
        2 : 150,
        3 : 300,
        4 : 500,
    };
}