if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = (await Promise.all (["Compendium.impmal-core.items.Item.1FcWnTOnesyuvoY2", "Compendium.impmal-core.items.Item.HzPLN852px00nlCn", "Compendium.impmal-core.items.Item.z19hLKrlKpBzOOGl", "Compendium.impmal-core.items.Item.sQYg7uYhPVTZCQoK", "Compendium.impmal-core.items.Item.FLT46Yd2d3nJzdSP"].map(fromUuid))).map(i => i.toObject());

let enemy = boons.find(i => i._id == "HzPLN852px00nlCn");
enemy.name = `${enemy.name} (Inquisitor Konstan Serranus)`
enemy.effects[0].changes[0].key = "system.influence.factions.inquisition-xenos.modifier";	

let roll = await new Roll("1d10").roll()
roll.toMessage(this.script.getChatData())

choice = boons[Math.floor((roll.total-1)/2)]

if (this.actor.items.getName(choice.name))
{
this.script.notification(`<strong>${this.actor.name}</strong> already owns <strong>${choice.name}</strong>`, "error")
}
else 
{
this.script.message(`Added <strong>${choice.name}</strong>`, {whisper : ChatMessage.getWhisperRecipients("GM")})
this.actor.createEmbeddedDocuments("Item", [choice])
}