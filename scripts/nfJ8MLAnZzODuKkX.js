if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.UHIPQFUJHldexY42", "Compendium.impmal-core.items.Item.iwn1zakDuIxlipwl", "Compendium.impmal-core.items.Item.PhdsEYE8sKiAwxCP", "Compendium.impmal-core.items.Item.FLT46Yd2d3nJzdSP", "Compendium.impmal-core.items.Item.Vos6coBLVjtdYLIR"].map(fromUuid))

let choice = await ItemDialog.create(boons.filter(b => !this.actor.items.getName(b.name)), 1, {text: "Select a Liability", title: this.effect.name})

this.actor.createEmbeddedDocuments("Item", choice)