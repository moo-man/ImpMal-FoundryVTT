if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.gVUYCjKQs6flnMAt", "Compendium.impmal-core.items.Item.z19hLKrlKpBzOOGl", "Compendium.impmal-core.items.Item.A4skow3Y6qtjlfFU", "Compendium.impmal-core.items.Item.r4yWt0s7xsSRiqWW", "Compendium.impmal-core.items.Item.MgFaMaMe3tkfY6xX"].map(fromUuid))

let choice = await ItemDialog.create(boons.filter(b => !this.actor.items.getName(b.name)), 1, {text: "Select a Liability", title: this.effect.name})

this.actor.createEmbeddedDocuments("Item", choice)