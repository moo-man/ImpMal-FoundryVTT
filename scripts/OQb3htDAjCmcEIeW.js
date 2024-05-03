let skills = args.actor.itemTypes.specialisation.filter(s => ["Sight", "Hearing", "Investigation", "Tracking", "Interrogation", "Inquiry"].includes(s.name) || ["discipline", "intuition"].includes(s.system.skill));

let chosen = (await DocumentChoice.create(skills, 1))[0]

if (chosen)
{
    await chosen.update({"system.advances" : chosen.system.advances + 1});
    await args.actor.update({"system.xp.other.list" : args.actor.system.xp.other.add({description : `${this.effect.name} (${chosen.name})`, xp: -20})})
}