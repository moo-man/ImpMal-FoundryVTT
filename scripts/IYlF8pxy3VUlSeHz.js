this.actor.setupSkillTest({key : "fortitude", name : "Pain"}, {appendTitle : " - " + this.effect.name}).then(test => {
	if (test.failed)
	{
		this.actor.addCondition("stunned");
	}
})