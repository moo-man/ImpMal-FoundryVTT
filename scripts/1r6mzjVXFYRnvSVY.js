let damage = 4 + this.effect.sourceActor.system.characteristics.wil.bonus + this.effect.sourceTest.result.SL

this.actor.applyDamage(damage, {location : "body"})

let test = await this.actor.setupSkillTest({key : "athletics", name : "Might"}, {fields : {difficulty : "routine"}, appendTitle : " - " + this.effect.name});

if (test.failed)
{
	this.actor.addCondition("prone");
}

