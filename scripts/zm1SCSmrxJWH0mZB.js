if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.BXf17lPVwJNZXsBF", "Compendium.impmal-core.items.Item.vDBCbMmOVepwwutd", "Compendium.impmal-core.items.Item.OjDwf7OeKxIgE1ot", "Compendium.impmal-core.items.Item.YINAX2VHjcrJRCaz", "Item.Gc6RpKjyUCzMkc3P"].map(fromUuid))

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