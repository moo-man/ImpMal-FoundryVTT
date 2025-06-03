if (args.actor.system.species == "Daemon") 
{

    if (this.item.system.category == "force")
    {
	args.modifiers.push({label : "Daemon", value : this.actor.system.warp.charge})
    }
    args.locationData.formula = "0"
}

if ((this.effect.getFlag("impmal", "trueNames") || []).includes(args.actor.name)) 
{
    let test = await args.actor.setupSkillTest({ key: "discipline" }, { appendTitle: ` – ${this.effect.label}` });

    if (test.failed) 
        {
        args.actor.addCondition("dead")
    }

}