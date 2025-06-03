        let test = await this.actor.setupSkillTest({key : "fortitude", name : "Endurance"}, {fields : {difficulty : "routine"}, appendTitle : " - " + this.effect.name})

        if (test.result.SL < this.effect.sourceTest?.result.SL)
        {
            let damage = this.effect.sourceTest.result.SL - test.result.SL;
            let damageData = await this.actor.applyDamage(damage, {ignoreAP : true});
            let message = `<p>Takes ${damage} Damage</p>`;
            if (damage > this.actor.system.characteristics.tgh.bonus)
            {
                message += `<p>Gains the <em>Poisoned</em> Condition</p>`;
                await this.actor.addCondition("poisoned");
            }
            this.script.scriptMessage(message);
        }