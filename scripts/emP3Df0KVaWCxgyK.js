if (args.item.type == "weapon" && args.item.system.isEquipped && args.item.system.isMelee && args.item.actor.itemTypes.weapon.filter(i => i.system.isEquipped && i.system.isMelee).length >= 2)
{
	args.item.system.traits.add("defensive", {modify: true})
}