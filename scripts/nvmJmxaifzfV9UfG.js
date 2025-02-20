let damageData = await this.actor.applyDamage(3 + this.effect.sourceActor.system.characteristics.wil.bonus)

this.script.scriptMessage(`Takes ${damageData.damage} Damage ${damageData.woundsGained != damageData.damage ? `(${damageData.woundsGained} Wounds)` : ""}`);