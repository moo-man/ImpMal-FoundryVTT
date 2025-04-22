if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.b8WqelD5As2fEgH8", "Compendium.impmal-inquisition.items.Item.S56anxusJpE26v03", "Compendium.impmal-core.items.Item.Iwf44rObvJUJyTr2", "Compendium.impmal-core.items.Item.jlCOJEp5lZEcSLig", "Compendium.impmal-core.items.Item.0XzUiF4iNsIRLy5L"].map(fromUuid))

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