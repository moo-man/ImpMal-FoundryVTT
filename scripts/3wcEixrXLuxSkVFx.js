if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.dI8lWuM7paHXUaK7", "Compendium.impmal-core.items.Item.pZ6zHYkCIWPBWdRQ", "Compendium.impmal-core.items.Item.GK9wvpMgakJrLJx9", "Compendium.impmal-core.items.Item.pYjc3gBZG4mSTyAb", "Compendium.impmal-core.items.Item.Tww7ioc1hjDZ9JPm"].map(fromUuid))

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