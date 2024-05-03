        let stunned = this.actor.hasCondition("stunned");

        if (stunned)
        {
            let test = await this.actor.setupSkillTest({key : "fortitude", name : "Endurance"}, {title : {append : " - " + this.effect.label}})
            if (test.succeeded)
            {
                this.script.scriptMessage("Removed Stunned");
                stunned.delete();
            }
        }