let test = await this.actor.setupSkillTest({name : "Endurance", key  : "fortitude"}, {appendTitle : ` - ${this.effect.name}`})

if (test.failed)
{
	this.actor.addCondition("fatigued");
}