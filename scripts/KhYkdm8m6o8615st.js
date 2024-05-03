        if (!args.opposed.attackerTest.item?.system.isMelee)
        {
            return;
        }
        let applyBleeding = await Dialog.wait({
            title : this.effect.label,
            content : `<p><strong>${this.effect.label}</strong>: Inflict Bleeding intead of Damage?`,
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

        if (applyBleeding)
        {
            await args.actor.addCondition("bleeding");
            args.critical = false;
            args.woundsGained = 0;
            args.text = `0 Wounds, Applied Bleeding (${this.effect.name})`
        }