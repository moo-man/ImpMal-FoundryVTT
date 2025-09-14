if (args.actor.system.species == "Daemon"){
let test = await args.actor.setupSkillTest({key : "discipline"}, {appendTitle : ` – ${this.effect.name}`});

if (test.failed)
{
  args.actor.addCondition("dead")
}
}