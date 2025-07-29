if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-core.items.Item.V69YxMlVqjD4eHQK", "Compendium.impmal-core.items.Item.UwxfB8YLI8zs2oCX", "Compendium.impmal-core.items.Item.yw68k1qdBS2eVi6f", "Compendium.impmal-core.items.Item.sltqe5Gyi7nSJJJa", "Compendium.impmal-core.items.Item.BjKarOCzVXP3qCoA"].map(fromUuid))

let choice = await ItemDialog.create(boons.filter(b => !this.actor.items.getName(b.name)), 1, {text: "Select a Liability", title: this.effect.name})

this.actor.createEmbeddedDocuments("Item", choice)