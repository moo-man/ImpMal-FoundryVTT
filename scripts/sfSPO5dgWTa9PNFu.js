let frightened = this.actor.hasCondition("frightened")

if (frightened)
{
	this.script.notification("Immune to Frightened");
	frightened.delete();
}