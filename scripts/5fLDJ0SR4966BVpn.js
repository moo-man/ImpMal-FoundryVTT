if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.dI8lWuM7paHXUaK7", "Compendium.impmal-core.items.Item.9BH8kppU2XZKFAil", "Compendium.impmal-core.items.Item.ZQVEe1jI680zL964", "Compendium.impmal-core.items.Item.wQ8JqH1Z23xAxchZ", "Compendium.impmal-core.items.Item.TlHiHOx0U3w5coz2"].map(fromUuid))

let choice = await ItemDialog.create(boons.filter(b => !this.actor.items.getName(b.name)), 1, {text: "Select a Boon", title: this.effect.name})

this.actor.createEmbeddedDocuments("Item", choice)