this.actor.applyDamage(5).then(data => ui.notifications.notify("Took " + data.woundsGained + " Damage from " + this.effect.name));

this.actor.addCondition("fatigued");