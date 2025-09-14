    let lostTeeth = this.actor.getFlag("impmal", "lostTeeth") || 0;
    lostTeeth += this.item.getFlag("impmal", "lostTeeth") || 1;
    foundry.utils.setProperty(this.actor, "flags.impmal.lostTeeth", lostTeeth);