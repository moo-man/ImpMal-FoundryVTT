if (args.actor.system.species == "Daemon"){
let test = await args.actor.setupSkillTest({key : "discipline"}, {title : {append : ` – ${this.effect.label}`}});

if (test.failed)
{
  args.actor.addCondition("dead")
}
}