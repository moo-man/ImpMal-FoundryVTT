        this.actor.setupSkillTest({key : "athletics", name : "Might"}, {appendTitle : ` – ${this.effect.label}`}).then(test => 
        {
            if (test.result.SL > this.effect.sourceTest.result.SL)
            {
                this.actor.removeCondition("restrained");
                this.effect.delete();
            }
        });