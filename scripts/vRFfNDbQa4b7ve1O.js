        let test = await this.actor.setupSkillTest({key : "fortitude"}, {appendTitle : ` – ${this.effect.name}`});
        if (test.succeeded && test.result.SL > 0)
        {
            args.modifiers.push({value : -test.result.SL, label : this.effect.name});
        }