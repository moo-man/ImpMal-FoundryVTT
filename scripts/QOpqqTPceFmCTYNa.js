        let test = await this.actor.setupSkillTest({key : "discipline", name : "Fear"}, {fields : {difficulty : "difficult"}, appendTitle : " - " + this.effect.name})
        if (test.failed)
        {
            this.actor.addCondition("frightened");
        }