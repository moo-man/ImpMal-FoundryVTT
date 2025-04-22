if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.1dHZM2MjjbDE3T1Z", "Compendium.impmal-core.items.Item.R9SSfEKEG0wtWFHL", "Compendium.impmal-core.items.Item.sMJxs1mX7S6xSGgi", "Compendium.impmal-core.items.Item.CNIbuDTtzLuJcYNZ", "Compendium.impmal-core.items.Item.xch6waGEoUq1IEnJ"].map(fromUuid))

let roll = await new Roll("1d10").roll()
roll.toMessage(this.script.getChatData())

choice = boons[Math.floor((roll.total-1)/2)]

if (this.actor.items.getName(choice.name))
{
this.script.notification(`<strong>${this.actor.name}</strong> already owns <strong>${choice.name}</strong>`, "error")
}
else 
{
this.script.message(`Added <strong>${choice.name}</strong>`)
this.actor.createEmbeddedDocuments("Item", [choice])
}