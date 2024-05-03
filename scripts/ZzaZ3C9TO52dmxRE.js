        this.actor.setupSkillTest({key : "discipline", name : "Fear"}, {title : {append : " – " + this.effect.name}}).then(test => {
            if (test.result.SL > this.effect.sourceTest.result.SL)
            {
                this.actor.hasCondition("frightened")?.delete();
                this.effect.delete();
            }
        });