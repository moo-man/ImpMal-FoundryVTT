if (this.actor.itemTypes.power.length)
    {
        let test = await this.actor.setupSkillTest({key : "psychicMastery"}, {fields : {difficulty : "difficult"}, title : {append : ` - ${this.effect.name}`}});
	if (test.failed)
		this.actor.addCondition("stunned");
    }