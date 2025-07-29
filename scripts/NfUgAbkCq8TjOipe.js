let bleeding = this.actor.hasCondition("bleeding");

if (bleeding)
{
  bleeding.delete();
  this.script.notification("Removed Bleeding");
  this.effect.updateSource({"flags.impmal.bleedingRemoved" : true});
}