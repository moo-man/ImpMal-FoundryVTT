if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = (await Promise.all (["Compendium.impmal-core.items.Item.gVUYCjKQs6flnMAt", "Compendium.impmal-core.items.Item.HzPLN852px00nlCn", "Compendium.impmal-core.items.Item.UwxfB8YLI8zs2oCX", "Compendium.impmal-core.items.Item.Wrn57qDWBEc2r6gu", "Compendium.impmal-core.items.Item.QPFh8UZwiazOndQD"].map(fromUuid))).map(i => i.toObject())

  let enemy = boons.find(i => i._id == "HzPLN852px00nlCn");
  enemy.name = `${enemy.name} (Inquisitor Eskender Thracius)`
  enemy.effects[0].changes[0].key = "system.influence.factions.inquisition-xenos.modifier";	

let choice = await ItemDialog.create(boons.filter(b => !this.actor.items.getName(b.name)), 1, {text: "Select a Liability", title: this.effect.name})

this.actor.createEmbeddedDocuments("Item", choice)