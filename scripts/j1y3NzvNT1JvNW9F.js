let healed = this.actor.system.characteristics.tgh.bonus;
this.script.scriptMessage("<strong>" + this.actor.name + "</strong> healed " + healed + " wounds");
await this.actor.update({"system.combat.wounds.value" : this.actor.system.combat.wounds.value - healed});