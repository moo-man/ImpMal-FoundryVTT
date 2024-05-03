        let skills = args.actor.itemTypes.specialisation.filter(s => ["People", "High Gothic", "Theology", "Charm"].includes(s.name) || s.system.skill == "presence");

        let chosen = (await DocumentChoice.create(skills, 1))[0]

        if (chosen)
        {
            await chosen.update({"system.advances" : chosen.system.advances + 1});
            await args.actor.update({"system.xp.other.list" : args.actor.system.xp.other.add({description : `${this.effect.name} (${chosen.name})`, xp: -20})})
        }