this.actor.applyDamage(5).then(data => ui.notifications.notify("Took " + data.woundsGained + " Damage from Hazard"));

let test = await this.actor.setupSkillTest({key : "reflexes", name : "Dodge"}, {fields : {difficulty : "hard"}, appendTitle : ` – ${this.effect.label}`})

if (!test.succeeded)
{
    this.actor.addCondition("ablaze");
}