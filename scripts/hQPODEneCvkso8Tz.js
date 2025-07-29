let poisoned = this.actor.hasCondition("poisoned")
if (poisoned)
{
  poisoned.delete();
  this.effect.update({"disabled" : true});
  this.script.notification("Removed Poisoned");
}
else 
{
  this.script.notification("No Poisoned Condition")
}