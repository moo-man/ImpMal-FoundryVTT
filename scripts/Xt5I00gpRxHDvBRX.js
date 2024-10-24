        let changes = [];
        if (["Astra Militarum", "Imperial Fleet", "Rogue Trader Dynasty"].includes(this.actor.system.faction.document?.name))
        {
            changes.push({key : "system.influence.factions.adeptus-ministorum.modifier", value : 1});
        }

        else if (["Adeptus Ministorum"].includes(this.actor.system.faction.document?.name))
        {

            let factionOptions = Object.keys(game.impmal.config.factions).filter(i => ["astra-militarum", "imperial-fleet"].includes(i)).map(i => { return {name : game.impmal.config.factions[i], id : i};});
            let choices = await ItemDialog.create(factionOptions, 1);
            if (choices.length)
            {
                changes.push({key : "system.influence.factions." + choices[0].id + ".modifier", value : 1});
            }
        }

        this.effect.updateSource({changes});