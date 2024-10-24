        let minor = [];
        if (this.item.system.taken < 2)
        {
            minor = await ItemDialog.create((await game.impmal.utility.getAllItems(["power"])).filter(i => i.system.discipline == "minor"), 1, {text : "Select a Minor Power", title : this.item.name});
        }

        let disciplines = foundry.utils.deepClone(game.impmal.config.disciplines);
        delete disciplines.minor;
        for(let power of this.actor.itemTypes["power"])
        {
            delete disciplines[power.system.discipline];
        }

        let discipline = (await ItemDialog.create(disciplines, 1, {text : "Select a Discipline", title : this.item.name}))[0];

        let major = await ItemDialog.create((await game.impmal.utility.getAllItems(["power"])).filter(i => i.system.discipline == discipline.id), 1, {text : "Select a Pyschic Power", title : this.item.name});

        return this.actor.createEmbeddedDocuments("Item", minor.concat(major).map(i => {
            i = i.toObject();
            i.system.xpOverride = 0;
            return i;
        }))