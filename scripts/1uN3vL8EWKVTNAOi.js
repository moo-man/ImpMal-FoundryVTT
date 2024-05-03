        this.actor.system.combat.armourModifier += this.effect.sourceTest.result.SL;
        for (let loc in this.actor.system.combat.hitLocations)
        {
            this.actor.system.combat.hitLocations[loc].sources.push({name : this.effect.name, value : this.effect.sourceTest.result.SL});
        }
