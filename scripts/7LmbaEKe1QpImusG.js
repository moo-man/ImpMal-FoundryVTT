        let minor = [];
        if (this.item.system.taken < 2)
        {
            minor = await DocumentChoice.create((await game.impmal.utility.getAllItems(["power"])).filter(i => i.system.discipline == "minor"), 1);
        }

        let disciplines = foundry.utils.deepClone(game.impmal.config.disciplines);
        delete disciplines.minor;
        for(let power of this.actor.itemTypes["power"])
        {
            delete disciplines[power.system.discipline];
        }

        let discipline = (await DocumentChoice.create(disciplines, 1))[0];

        let major = await DocumentChoice.create((await game.impmal.utility.getAllItems(["power"])).filter(i => i.system.discipline == discipline.id), 1);

        return this.actor.createEmbeddedDocuments("Item", minor.concat(major).map(i => {
            i = i.toObject();
            i.system.xpOverride = 0;
            return i;
        }))