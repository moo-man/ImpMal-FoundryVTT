        if (args.type == "critical")
        {
            let test = await this.actor.setupSkillTest({name : "Theology", key : "lore"}, {title : {append: " – " + this.effect.name}})
            if (test.succeeded)
            {
                this.script.scriptMessage(`Ignore Critical effects for ${this.actor.system.characteristics.wil.bonus} Rounds`)
            }
        }