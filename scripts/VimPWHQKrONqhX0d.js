if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.b8WqelD5As2fEgH8", "Compendium.impmal-core.items.Item.mtAYC82VRH975p1B", "Compendium.impmal-core.items.Item.GB0MqGmFy0FGHIVy", "Compendium.impmal-core.items.Item.uT72W5ZHNDeLtGtM", "Compendium.impmal-core.items.Item.Tww7ioc1hjDZ9JPm"].map(fromUuid))

let choice = await ItemDialog.create(boons.filter(b => !this.actor.items.getName(b.name)), 1, {text: "Select a Boon", title: this.effect.name})

this.actor.createEmbeddedDocuments("Item", choice)