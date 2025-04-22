if (args.opposed && args.opposed.attackerTest.item?.system.isRanged)
{
	args.modifiers.push({value : -1, label : this.effect.name, armour : true})
}