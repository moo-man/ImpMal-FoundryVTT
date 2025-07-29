let fatigued = this.actor.hasCondition("fatigued")
if (fatigued)
{
  fatigued.delete();
  this.effect.update({"disabled" : true});
  this.script.notification("Removed Fatigued");
}
else 
{
  this.script.notification("No Fatigued Condition")
}