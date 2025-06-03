
            this.actor.setupSkillTest({key : "discipline"}, {appendTitle : " - " + this.effect.name}).then(test => 
            {
                if (test.failed)
                {
                    this.actor.addCondition("stunned");
                }
            });
