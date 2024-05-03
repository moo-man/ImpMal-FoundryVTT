let lostToes = this.item.getFlag("impmal", "lostToes") || 1;
this.actor.system.characteristics.ws.modifier -= lostToes;
this.actor.system.characteristics.ag.modifier -= lostToes;
this.actor.overrides["system.characteristics.ws.modifier"] = true;
this.actor.overrides["system.characteristics.ag.modifier"] = true;