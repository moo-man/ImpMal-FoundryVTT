if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.1dHZM2MjjbDE3T1Z", "Compendium.impmal-core.items.Item.R9SSfEKEG0wtWFHL", "Compendium.impmal-core.items.Item.sMJxs1mX7S6xSGgi", "Compendium.impmal-core.items.Item.CNIbuDTtzLuJcYNZ", "Compendium.impmal-core.items.Item.xch6waGEoUq1IEnJ"].map(fromUuid))

let choice = await ItemDialog.create(boons.filter(b => !this.actor.items.getName(b.name)), 1, {text: "Select a Boon", title: this.effect.name})

this.actor.createEmbeddedDocuments("Item", choice)