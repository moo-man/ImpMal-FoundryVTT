 if (!args.opposed.attackerTest.data.rapidFire)
        {
            return;
        }

        let applyRestrained = await foundry.applications.api.Dialog.confirm({
            window : {title : this.effect.name},
            content : `Attempt to inflict Restrained intead of Damage?`,
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