if (args.result.critical)
{
   args.result.critModifier += this.actor.system.skills.medicae.advances
   args.result.tags.appliedAnatomy = this.effect.name
}