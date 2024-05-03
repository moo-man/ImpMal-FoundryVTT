            let factionOptions = Object.keys(game.impmal.config.factions).map(i => { return {name : game.impmal.config.factions[i], id : i};});
                
            let choices = await DocumentChoice.create(factionOptions, 1, {text : "Select the Faction to switch to"});
            if (choices.length)
            {
                await this.effect.update({changes : [{key : "system.influence.factions." + choices[0].id + ".modifier", value : 1, mode : CONST.ACTIVE_EFFECT_MODES.ADD}]});
		args.actor.reset();
		args.actor.sheet?.render(true);
            }
