let fatigued = this.actor.hasCondition("fatigued")
if (fatigued)
{
   this.script.notification("Immune to Fatigued")
   fatigued.delete()
}