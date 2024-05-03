        let linkedEffect = fromUuidSync(this.effect.flags.impmal?.linkedEffect);

        if (linkedEffect)
        {
            let actor = linkedEffect.actor;

            if (actor)
            {
                let damageData = await actor.applyDamage(3 + this.actor.system.characteristics.wil.bonus, {ignoreAP : true, update: false});
                let healed = Math.ceil(damageData.woundsGained / 2);
                await this.actor.update({"system.combat.wounds.value" : this.actor.system.combat.wounds.value - healed});
                this.script.scriptMessage(`<p><strong>${actor.name}</strong> takes ${damageData.woundsGained} Damage.</p> <p><strong>${this.actor.name}</strong> heals ${healed} Wounds</p>`);
                SocketHandlers.executeOnOwner(actor, "updateActor", {update : damageData.updateData, speaker : ChatMessage.getSpeaker({actor})});
            }
        }
	else 
	{
		ui.notifications.error("No linked effect!")
	}