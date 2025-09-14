foundry.utils.setProperty(this.actor, "flags.impmal.eyesLost", this.actor.flags.impmal?.eyesLost || 0)

this.actor.flags.impmal.eyesLost++;

if (this.actor.flags.impmal.eyesLost >= 2 && !this.actor.hasCondition("blinded"))
{
    this.actor.addCondition("blinded");
}