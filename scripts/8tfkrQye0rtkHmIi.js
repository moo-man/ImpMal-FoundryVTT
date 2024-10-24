let skills = args.actor.itemTypes.specialisation.filter(s => ["People", "High Gothic", "Evaluation", "Investigation", "Academics", "Common", "Human", "Inquiry"].includes(s.name));

let chosen = (await ItemDialog.create(skills, 1))[0]

if (chosen)
{
    await chosen.update({"system.advances" : chosen.system.advances + 1});
    await args.actor.update({"system.xp.other.list" : args.actor.system.xp.other.add({description : `${this.effect.name} (${chosen.name})`, xp: -20})})
}