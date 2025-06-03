if (this.actor.hasCondition("prone")) return;
        
this.actor.setupSkillTest({key : "athletics", name : "Might"}, {fields: {difficulty: "routine"}, appendTitle : ` – ${this.effect.label}`}).then(test => 
        {
            if (test.result.SL < this.effect.sourceTest.result.SL)
            {
                this.actor.addCondition("prone");
            }
        });