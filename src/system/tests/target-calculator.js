export class TargetCalculator
{
    // constructor({actor, type, item, modifier, difficulty})
    // {
    //     this.actor = actor;
    //     this.type = type;
    //     this.item = item;
    //     this.modifier = modifier;
    //     this.difficulty = difficulty;
    // }

    static typeMap = {
        "characteristic" : this.characteristicTarget.bind(this),
        "skill" : this.skillTarget.bind(this),
        "weapon" : this.weaponTarget.bind(this),
        "power" : this.powerTarget.bind(this)
    };


    static compute({actor, type, data, modifier=0, difficulty="challenging"}={})
    {
        return this.typeMap[type](data, {actor, modifier, difficulty});
    }

    static characteristicTarget(characteristic, {actor, modifier=0, difficulty="challenging"}={})
    {
        return actor.system.characteristics[characteristic].total + this._baseTarget({modifier, difficulty});
    }

    static skillTarget(skill, {actor, modifier=0, difficulty="challenging"}={})
    {
        let skillTotal;
        if (typeof skill == "string")
        {
            skillTotal = actor.system.skills[skill].total;
        }
        else if (skill instanceof Item)
        {
            skillTotal = skill.system.total;
        }

        return skillTotal + this._baseTarget({modifier, difficulty});
    }

    static weaponTarget(weapon, {actor, modifier=0, difficulty="challenging"}={}) 
    {
        return this.skillTarget(weapon.system.skill, {actor, modifier, difficulty});
    }

    static powerTarget(power, {actor, modifier=0, difficulty="challenging"}={}) 
    {
        return this.skillTarget(power.system.skill, {actor, modifier, difficulty});
    }

    static _baseTarget({modifier=0, difficulty="challenging"}={})
    {
        return modifier + (game.impmal.config.difficulties[difficulty]?.modifier || 0);
    }
}