        let frightened = this.actor.hasCondition("frightened");
        if (frightened)
        {
            frightened.delete();
            ui.notifications.notify(`<strong>${this.effect.name}</strong> - Immune to Frightened`);
        }