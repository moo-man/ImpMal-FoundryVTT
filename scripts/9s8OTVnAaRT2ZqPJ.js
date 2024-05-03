        let bleeding = this.actor.hasCondition("bleeding");
        let difficulty;
        if (bleeding?.isMajor)
        {
            difficulty = "hard";
        }
        else if (bleeding?.isMinor)
        {
            difficulty = "challenging";
        }
        if (bleeding)
        {
            this.actor.setupSkillTest({key : "fortitude"}, {fields : {difficulty}}).then(test => 
            {
                if (test.result.outcome == "success")
                {
                    bleeding.delete();
                }
            });
        }