 if (!args.opposed.attackerTest.data.rapidFire)
        {
            return;
        }
        let applyRestrained = await Dialog.wait({
            title : this.effect.label,
            content : `<p><strong>${this.effect.label}</strong>: Attempt to inflict Restrained intead of Damage?`,
            buttons : {
                yes : {
                    label : game.i18n.localize("Yes"),
                    callback : () => 
                    {
                        return true;
                    }
                },
                no : {
                    label : game.i18n.localize("No"),
                    callback : () => 
                    {
                        return false;
                    }
                }
            }
        });

        if (applyRestrained)
        {
            args.actor.setupSkillTest({key : "discipline", name : "Fear"}, {appendTitle : " - " + this.effect.name}).then(test => 
            {
                if (test.result.SL < args.opposed.attackerTest.result.SL)
                {
                    args.actor.addCondition("restrained");
                }
            });
            args.critical = false;
            args.woundsGained = 0;
            args.text = `0 Wounds, Applied Restrained (${this.effect.name})`;
        }