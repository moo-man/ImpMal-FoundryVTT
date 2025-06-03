    let test = await this.actor.setupSkillTest({key : "fortitude", name : "Pain"}, {appendTitle : " - " + this.effect.name});

    if (test.succeeded)
    {
        await this.actor.addCondition("stunned");
    }
    else 
    {
        await this.actor.addCondition("incapacitated");
        await this.actor.addCondition("prone");
    }
    
    let teeth = (await game.impmal.utility.findId("GvHZsCJUIJ32TVhe")).toObject();
    let injury = (await game.impmal.utility.findId("MgCNNlz6oIdeo99L")).toObject();
    
    let teethRoll = new Roll("1d10");
    await teethRoll.roll();
    
    teethRoll.toMessage({speaker : {alias : this.effect.name}, flavor : "Teeth Lost"});
    
    teeth.name = teeth.name.replace("Teeth", `${teethRoll.total} Teeth`);
    setProperty(teeth, "flags.impmal.lostTeeth", teethRoll.total)
    
    this.actor.createEmbeddedDocuments("Item", [teeth, injury]);