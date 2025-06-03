        let test = await this.actor.setupSkillTest({key : "discipline", name : "Fear"}, {appendTitle : " - " + this.effect.name})
        if (test.failed)
        {
            this.actor.addCondition("frightened");
        }