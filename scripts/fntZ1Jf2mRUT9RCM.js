    if (!this.actor.system.skills.rapport.lostTeethModified)
    {
        let lostTeeth = this.actor.getFlag("impmal", "lostTeeth");
        let modifier = Math.floor(lostTeeth / 2);
        this.actor.system.skills.rapport.modifier = -1 * modifier;
        this.actor.system.skills.rapport.lostTeethModified = true;
    }