if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.gVUYCjKQs6flnMAt", "Compendium.impmal-core.items.Item.z19hLKrlKpBzOOGl", "Compendium.impmal-core.items.Item.A4skow3Y6qtjlfFU", "Compendium.impmal-core.items.Item.r4yWt0s7xsSRiqWW", "Compendium.impmal-core.items.Item.MgFaMaMe3tkfY6xX"].map(fromUuid))

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