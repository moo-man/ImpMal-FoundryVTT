if (!game.user.isGM)
{
  return this.script.notification("Must be GM perform this action", "error")
}

let boons = await Promise.all (["Compendium.impmal-inquisition.items.Item.41xnk9hJVhc0555E", "Compendium.impmal-core.items.Item.UwxfB8YLI8zs2oCX", "Compendium.impmal-core.items.Item.BA39qqXNHcPkALqf", "Compendium.impmal-core.items.Item.yw68k1qdBS2eVi6f", "Compendium.impmal-core.items.Item.87FNdN6pEeNlJRT4"].map(fromUuid))

let choice = await ItemDialog.create(boons.filter(b => !this.actor.items.getName(b.name)), 1, {text: "Select a Liability", title: this.effect.name})

this.actor.createEmbeddedDocuments("Item", choice)