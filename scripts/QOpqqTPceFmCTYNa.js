        let test = await this.actor.setupSkillTest({key : "discipline", name : "Fear"}, {fields : {difficulty : "difficult"}, title : {append : " - " + this.effect.name}})
        if (test.failed)
        {
            this.actor.addCondition("frightened");
        }