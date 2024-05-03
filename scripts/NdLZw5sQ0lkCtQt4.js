        let damage = this.effect.flags.impmal?.damage || 0;
        this.actor.applyDamage(damage, {ignoreAP : true});
        this.script.scriptMessage(damage + " applied to <strong>" + this.actor.name + "</strong>");