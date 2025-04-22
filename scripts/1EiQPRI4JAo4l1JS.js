if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.dI8lWuM7paHXUaK7", "Compendium.impmal-core.items.Item.9BH8kppU2XZKFAil", "Compendium.impmal-core.items.Item.ZQVEe1jI680zL964", "Compendium.impmal-core.items.Item.wQ8JqH1Z23xAxchZ", "Compendium.impmal-core.items.Item.TlHiHOx0U3w5coz2"].map(fromUuid))

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