let helped = this.actor.effects.find(i => i.statuses.has("helped"))
if (helped)
{
	this.script.scriptMessage("Cannot be helped");
	await helped.delete();
}