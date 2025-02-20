let test = await this.actor.setupSkillTest({name : "Endurance", key  : "fortitude"}, {title : {append : ` - ${this.effect.name}`}})

if (test.failed)
{
	this.actor.addCondition("fatigued");
}