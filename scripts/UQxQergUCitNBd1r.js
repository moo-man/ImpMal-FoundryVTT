        let locations = Object.keys(this.actor.system.combat.hitLocations).map(k => 
        {
            return {id : k, name : game.i18n.localize(this.actor.system.combat.hitLocations[k].label)};
        });
            
        let location = (await DocumentChoice.create(locations, 1))[0].id;
            
        let protection = this.actor.system.combat.hitLocations[location].items.filter(i => i.type == "protection");
        let item;
        if (protection.length > 1)
        {
            item = (await DocumentChoice.create(protection, 1))[0];
        }
        else 
        {
            item = protection[0];
        }

        await item.update({["system.damage." + location] : this.effect.sourceTest.result.SL});
        this.script.scriptMessage(item.name + " damaged by " + this.effect.sourceTest.result.SL);