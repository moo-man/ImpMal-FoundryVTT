            let factionOptions = Object.keys(game.impmal.config.factions).map(i => { return {name : game.impmal.config.factions[i], id : i};});
                
            let choices = await DocumentChoice.create(factionOptions, 1);
            if (choices.length)
            {
                this.effect.update({changes : [{key : "system.influence.factions." + choices[0].id + ".modifier", value : -1}]});
            }
