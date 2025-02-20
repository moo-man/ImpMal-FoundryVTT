if (args.actor.system.species == "Daemon" || args.actor.itemTypes.power.length)
{
args.traits.add("rend", {modify: true, value : this.actor.system.characteristics.wil.bonus})
}