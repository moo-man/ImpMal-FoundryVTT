let skills = args.actor.itemTypes.specialisation.filter(s => ["Fear", "Human", "One-handed", "Surface"].includes(s.name) || ["athletics", "fortitude", "ranged"].includes(s.system.skill));

let chosen = (await DocumentChoice.create(skills, 1))[0]

if (chosen)
{
    await chosen.update({"system.advances" : chosen.system.advances + 1});
    await args.actor.update({"system.xp.other.list" : args.actor.system.xp.other.add({description : `${this.effect.name} (${chosen.name})`, xp: -20})})
}