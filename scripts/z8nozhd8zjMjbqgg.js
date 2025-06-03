if (this.actor.uuid == ChatMessage.getSpeakerActor(this.effect.sourceTest?.context.speaker).uuid)
	return;        


this.actor.applyDamage(5).then(data => ui.notifications.notify("Took " + data.woundsGained + " Damage from Hazard"));

if (this.actor.hasCondition("blinded"))
{
  return 
}


        this.actor.setupSkillTest({key : "reflexes", name : "Dodge"}, {fields : {difficulty : "hard"}, appendTitle : ` – ${this.effect.label}`}).then(test => {

if (test.result.SL > this.effect.sourceTest?.result?.SL)
{
    this.actor.addCondition("blinded");
}
        });