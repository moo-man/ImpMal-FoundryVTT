        let skills = args.actor.itemTypes.specialisation.filter(s => ["tech", "lore", "logic"].includes(s.system.skill));

        let chosen = (await ItemDialog.create(skills, 1))[0]

        if (chosen)
        {
            await chosen.update({"system.advances" : chosen.system.advances + 1});
            args.actor.update({"system.xp.other.list" : args.actor.system.xp.other.add({description : `${this.effect.name} (${chosen.name})`, xp: -20})})
        }