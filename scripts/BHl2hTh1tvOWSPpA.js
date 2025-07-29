if (args.failed)
{
  this.actor.addCondition("fatigued");
  this.script.notification("Gained Fatigued")
}