        if (getProperty(args, "data.system.influence.usePatron"))
        {
            (await new Roll("1d10").roll()).toMessage({speaker : {alias : this.effect.name}});
        }