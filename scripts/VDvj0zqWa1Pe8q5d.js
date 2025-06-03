        if (!args.context.blackouts && args.result.fumble)
        {
            args.context.blackouts = true;
            this.actor.setupSkillTest({key : "fortitude", name : "Endurance"}, {appendTitle : " - " + this.effect.name}).then(test => 
            {
                if (test.failed)
                {
                    this.actor.addCondition("incapacitated", {duration : {rounds : Math.ceil(CONFIG.Dice.randomUniform() * 10)}});
                }
            });
        }