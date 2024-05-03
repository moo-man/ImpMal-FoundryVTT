if (this.actor.hasCondition("blinded"))
{
	ui.notifications.notify("Immune to the Blinded Condition")
	this.actor.hasCondition("blinded")?.delete();
}