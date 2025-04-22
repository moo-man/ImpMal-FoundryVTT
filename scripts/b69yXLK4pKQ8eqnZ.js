if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.dI8lWuM7paHXUaK7", "Compendium.impmal-core.items.Item.pZ6zHYkCIWPBWdRQ", "Compendium.impmal-core.items.Item.GK9wvpMgakJrLJx9", "Compendium.impmal-core.items.Item.pYjc3gBZG4mSTyAb", "Compendium.impmal-core.items.Item.Tww7ioc1hjDZ9JPm"].map(fromUuid))

let choice = await ItemDialog.create(boons.filter(b => !this.actor.items.getName(b.name)), 1, {text: "Select a Boon", title: this.effect.name})

this.actor.createEmbeddedDocuments("Item", choice)