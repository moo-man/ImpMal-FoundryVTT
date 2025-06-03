
        let blinded = this.actor.hasCondition("blinded");
        let num = blinded?.getFlag("impmal", "sunburst");
        if (blinded && num)
        {
            this.actor.setupSkillTest({key : "fortitude", name : "Endurance"}, {appendTitle : ` – ${this.effect.label}`}).then(test => {
                if (test.result.SL < this.effect.sourceTest.result.SL)
                {
                    num++;
                    blinded.setFlag("impmal", "sunburst", num);
                    if (num >= 3)
                    {
                        this.script.scriptMessage("<strong>Blinded</strong> is now permanent");
                        this.effect.delete();
                    }
                } 
                else 
                {
                    blinded.delete();
                }
            });
        }