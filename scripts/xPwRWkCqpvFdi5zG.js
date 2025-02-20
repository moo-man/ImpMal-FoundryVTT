if (args.actor.system.statuses.has("bleeding"))
{
	this.script.message("Healed 1 Wound");
	this.actor.update({"system.combat.wounds.value" : args.actor.system.combat.wounds.value - 1})

}