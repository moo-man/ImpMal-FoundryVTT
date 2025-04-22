if (!(args.opposed.attackerTest.power))
{
	let halved = Math.floor(args.woundsGained / 2);

	// recalculate criticals with halved values
	let excess = (halved + this.actor.system.combat.wounds.value) - this.actor.system.combat.wounds.max;
        if (excess > 0)
        {
		args.excess = excess;
		args.critical = true;
	}
	else 
	{
		args.excess = 0;
		args.critical = false;
	}	
	args.woundsGained = halved;
	args.modifiers.push({value : "Halved", label : this.effect.name})
}