        if (args.woundsGained > 0)
        {
	        await this.effect.update({["flags.impmal.relentlessPursuitIds." + args.actor.id] :  true})
		ui.notifications.notify(`<strong>${this.effect.name}</strong>: Quarry added`)
        }