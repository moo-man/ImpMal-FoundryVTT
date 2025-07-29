if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.BXf17lPVwJNZXsBF", "Compendium.impmal-core.items.Item.vDBCbMmOVepwwutd", "Compendium.impmal-core.items.Item.OjDwf7OeKxIgE1ot", "Compendium.impmal-core.items.Item.YINAX2VHjcrJRCaz", "Item.Gc6RpKjyUCzMkc3P"].map(fromUuid))

let choice = await ItemDialog.create(boons.filter(b => !this.actor.items.getName(b.name)), 1, {text: "Select a Boon", title: this.effect.name})

this.actor.createEmbeddedDocuments("Item", choice)