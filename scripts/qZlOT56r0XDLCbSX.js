        let protection = args.locationData.items.filter(i => i.type == "protection");
        for(let item of protection)
        {
            item.update({["system.damage." + args.locationData.key] : item.system.damage[args.locationData.key] + this.actor.system.characteristics.wil.bonus});
        }
        if (protection.length > 0)
        {
            this.script.scriptMessage(protection.map(i => i.name).join(", ") + " damaged by " + this.actor.system.characteristics.wil.bonus);
        }