if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.b8WqelD5As2fEgH8", "Compendium.impmal-inquisition.items.Item.S56anxusJpE26v03", "Compendium.impmal-core.items.Item.Iwf44rObvJUJyTr2", "Compendium.impmal-core.items.Item.jlCOJEp5lZEcSLig", "Compendium.impmal-core.items.Item.0XzUiF4iNsIRLy5L"].map(fromUuid))

let choice = await ItemDialog.create(boons.filter(b => !this.actor.items.getName(b.name)), 1, {text: "Select a Boon", title: this.effect.name})

this.actor.createEmbeddedDocuments("Item", choice)