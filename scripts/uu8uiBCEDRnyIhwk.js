        let test = await this.actor.setupSkillTest({key : "fortitude", name : "Pain"}, {title : {append : " - " + this.script.label}})
        if (test.failed)
        {
            this.actor.addCondition("incapacitated")
        }