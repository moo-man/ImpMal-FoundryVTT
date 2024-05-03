        let roll = Math.ceil(CONFIG.Dice.randomUniform() * 10);
        let hitloc = this.actor.system.combat.hitLocations[this.actor.system.combat.hitLocAt(roll)];

        if (hitloc?.label)
        {
            this.item.updateSource({name : `${this.effect.name} (${game.i18n.localize(hitloc.label)})`});
            this.script.scriptMessage(`<a class="inline-roll" data-tooltip="1d10"><i class="fas fa-dice-d20"></i> ${roll}</a>: ${game.i18n.localize(hitloc.label)}`, {whisper : ChatMessage.getWhisperRecipients("GM").map(i => i.id)});
        }