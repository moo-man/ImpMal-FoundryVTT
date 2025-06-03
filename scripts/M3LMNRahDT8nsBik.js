if (this.actor.uuid == ChatMessage.getSpeakerActor(this.effect.sourceTest?.context.speaker).uuid)
	return;

this.actor.applyDamage(5).then(data => ui.notifications.notify("Took " + data.woundsGained + " Damage from Hazard"));

if (this.actor.hasCondition("blinded"))
{
  return;
}

let test = await this.actor.setupSkillTest({key : "fortitude", name : "Endurance"}, {fields : {difficulty : "hard"}, appendTitle : ` – ${this.effect.label}`})

if (test.result.SL > this.effect.sourceTest?.result?.SL)
{
    this.actor.addCondition("blinded");
}