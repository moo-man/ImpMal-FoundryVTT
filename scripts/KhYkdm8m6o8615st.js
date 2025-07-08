        if (!args.opposed.attackerTest.item?.system.isMelee)
        {
            return;
        }

        let applyBleeding = await foundry.applications.api.Dialog.confirm({
            window : {title : this.effect.name},
            content : `Inflict Bleeding intead of Damage?`,
        });

        if (applyBleeding)
        {
            await args.actor.addCondition("bleeding");
            args.critical = false;
            args.woundsGained = 0;
            args.text = `0 Wounds, Applied Bleeding (${this.effect.name})`
        }