if (args.data.system?.corruption?.value > this.actor.system.corruption?.value)
{
	args.data.system.corruption.value++;
	this.script.scriptMessage("Extra Corruption Point Gained");
	this.script.scriptNotification("Extra Corruption Point Gained");
}