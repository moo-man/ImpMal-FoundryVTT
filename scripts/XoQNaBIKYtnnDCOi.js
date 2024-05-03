        let roll1 = Math.ceil(CONFIG.Dice.randomUniform() * 10);
        let roll2 = Math.ceil(CONFIG.Dice.randomUniform() * 10);
        let hitloc1 = this.actor.system.combat.hitLocations[this.actor.system.combat.hitLocAt(roll1)];
        let hitloc2 = this.actor.system.combat.hitLocations[this.actor.system.combat.hitLocAt(roll2)];

        this.item.updateSource({name : `${this.effect.name} (${game.i18n.localize(hitloc1.label)}, ${game.i18n.localize(hitloc2.label)})`});
        this.script.scriptMessage(`
        <a class="inline-roll" data-tooltip="1d10"><i class="fas fa-dice-d20"></i> ${roll1}</a>: ${game.i18n.localize(hitloc1.label)}<br>
        <a class="inline-roll" data-tooltip="1d10"><i class="fas fa-dice-d20"></i> ${roll2}</a>: ${game.i18n.localize(hitloc2.label)}`, {whisper : ChatMessage.getWhisperRecipients("GM").map(i => i.id)});