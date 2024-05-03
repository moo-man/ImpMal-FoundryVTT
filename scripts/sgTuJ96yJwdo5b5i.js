        let wounds = this.actor.system.combat.wounds;
        if (wounds.value > 0)
        {
            this.script.scriptMessage("Regenerates 1 Wound");
            this.actor.update({"system.combat.wounds.value" : wounds.value - 1});
        }