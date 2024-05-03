        let test = await this.actor.setupSkillTest({key : "discipline", name : "Fear"}, {title : {append : " - " + this.effect.name}})
        if (test.failed)
        {
            this.actor.addCondition("frightened");
        }