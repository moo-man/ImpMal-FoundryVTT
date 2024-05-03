        let healed = this.actor.system.characteristics.tgh.bonus + this.effect.sourceTest.result.SL + this.effect.sourceTest.actor.system.characteristics.wil.bonus;
        this.script.scriptMessage("<strong>" + this.actor.name + "</strong> healed " + healed + " wounds");
        await this.actor.update({"system.combat.wounds.value" : this.actor.system.combat.wounds.value - healed});
        await this.actor.hasCondition("bleeding")?.delete()
        
        let existing = this.actor.effects.find(e => e.getFlag("impmal", "sealWounds"))

        if (existing)
        {
            await this.actor.addCondition("fatigued")
            this.script.options.immediate.deleteEffect = true;
        }
        else 
        {
            this.effect.updateSource({"flags.impmal.sealWounds" : true})
        }