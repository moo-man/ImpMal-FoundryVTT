this.actor.setupSkillTest({key : "fortitude", name : "Pain"}, {title : {append : " - " + this.effect.name}}).then(test => {
	if (test.failed)
	{
		this.actor.addCondition("stunned");
	}
})