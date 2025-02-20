if (args.actor.system.species == "Daemon" || args.actor.itemTypes.power.length)
{
	args.woundsGained *= 2;
	args.excess = Math.max(0, (args.woundsGained + args.actor.system.combat.wounds.value) - args.actor.system.combat.wounds.max);
	if (args.excess)
	{
	        args.critical = true;
	}
}