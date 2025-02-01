        let location = this.effect.getFlag("impmal", "location");
        if (location)
        {
            args.actor.system.combat.hitLocations[location].armour++;
            args.actor.system.combat.hitLocations[location].sources.push({name : this.effect.name, value : 1}) 
        }