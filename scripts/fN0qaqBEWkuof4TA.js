if (args.characteristic == "str")
{
	args.fields.SL += this.actor.system.characteristics.str.bonus
}

if (args.weapon?.system.isMelee)
{
	args.fields.damage += this.actor.system.characteristics.str.bonus
}