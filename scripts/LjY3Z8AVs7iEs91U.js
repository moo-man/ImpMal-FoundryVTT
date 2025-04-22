if (["aim", "hide"].includes(this.actor.system.combat.action) && args.item.system.traits?.has("penetrating"))
{
	args.item.system.traits.add("penetrating", {modify: true})
}