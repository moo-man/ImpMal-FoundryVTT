
            this.actor.setupSkillTest({key : "discipline"}, {title : {append : " - " + this.effect.name}}).then(test => 
            {
                if (test.failed)
                {
                    this.actor.addCondition("stunned");
                }
            });
