        if (this.actor.system.corruption.value > 0)
        {
            this.actor.update({"system.corruption.value" : 0});
            ui.notifications.notify(`<strong>${this.effect.name}</strong>: Cannot gain Corruption Points`);
        }