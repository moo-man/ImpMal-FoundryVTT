let skills = args.actor.itemTypes.specialisation.filter(s => ["Sight", "Hearing", "Investigation", "Tracking", "Interrogation", "Inquiry"].includes(s.name) || ["discipline", "intuition"].includes(s.system.skill));

if (!skills.length)
{
    return this.script.notification(`This Actor does not have any of the valid specialisations`, "error")
}

let chosen = (await ItemDialog.create(skills, 1, {text : "Select the Specialisation to train", title : this.effect.name}))[0]

if (chosen)
{
    this.script.message(`Trained ${chosen.name} for ${(chosen.system.advances + 1) * 50 - 20} XP`)
    await chosen.update({"system.advances" : chosen.system.advances + 1});
    await args.actor.update({"system.xp" : args.actor.system.xp.other.add({description : `${this.effect.name} (${chosen.name})`, xp: -20})})
}