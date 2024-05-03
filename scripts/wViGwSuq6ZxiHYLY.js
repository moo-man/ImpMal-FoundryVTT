        let test = await this.actor.setupSkillTest({key : "discipline", name : "Psychic"}, {fields : {difficulty : "difficult"}, title : {append : " - " + this.effect.name}});

        if (this.effect.sourceTest.result.SL > test.result.SL)
        {
            let damage = (this.effect.sourceTest.actor.system.characteristics.wil.bonus + (this.effect.sourceTest.result.SL - test.result.SL));
            if (this.actor.system.species == "Daemon" || this.actor.itemTypes.power.length > 0)
            {
                damage *= 2;
            }
            else if (false) // How to determine if null?
            {
                damage = 0;
            }
            let damageData = await this.actor.applyDamage(damage, {ignoreAP : true});

            this.script.scriptMessage(`Suffers ${damage} Damage ${damageData.woundsGained != damage ? `(${damageData.woundsGained} Wounds)` : ""}`);
        }