        if (args.data.weapon.system.mag.current >= Number(args.data.weapon.system.traits.has("rapidFire").value) * 2)
        {
            args.data.context.fullAutoFanatic = true;
        }
        else 
        {   
            ui.notifications.error("Not enough ammo for " + this.effect.name);
            throw new Error("Not enough ammo for " + this.effect.name);
        }
