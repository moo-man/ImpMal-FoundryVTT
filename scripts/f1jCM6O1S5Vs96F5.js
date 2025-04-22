if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.UHIPQFUJHldexY42", "Compendium.impmal-core.items.Item.iwn1zakDuIxlipwl", "Compendium.impmal-core.items.Item.PhdsEYE8sKiAwxCP", "Compendium.impmal-core.items.Item.FLT46Yd2d3nJzdSP", "Compendium.impmal-core.items.Item.Vos6coBLVjtdYLIR"].map(fromUuid))

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