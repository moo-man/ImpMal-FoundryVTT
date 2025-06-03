        if (this.actor.hasCondition("stunned"))
            return;
        this.actor.setupSkillTest({key : "fortitude", name : "Endurance"}, {appendTitle : " - " + this.effect.name, fields : {difficulty : "hard"}}).then(test => 
            {
                if (!test.succeeded)
                {
                    this.actor.addCondition("stunned");
                }
            });