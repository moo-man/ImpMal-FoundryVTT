
        if (this.actor.uuid == ChatMessage.getSpeakerActor(this.effect.sourceTest.context.speaker).uuid)
            return

        this.actor.setupSkillTest({key: "discipline", name : "Fear"}, {appendTitle : " - " + this.effect.name}).then(test => {
            if (test.result.SL > this.effect.sourceTest.result.SL)
            {
                this.effect.delete();
            }
            else 
            {
                this.actor.addCondition("frightened");
            }
        });