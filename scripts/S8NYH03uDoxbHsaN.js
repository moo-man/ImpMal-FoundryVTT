await this.actor.applyDamage(6 + this.effect.sourceTest?.result?.SL);

let test = await this.actor.setupSkillTest({key : "reflexes", name : "Dodge"}, {fields : {difficulty : "hard"}, appendTitle : ` – ${this.effect.label}`})

if (test.result.SL > this.effect.sourceTest?.result?.SL)
{
    this.actor.addCondition("ablaze");
}