let items = await Promise.all(["Compendium.impmal-core.items.Item.0WV8IJuVkxLdOuem", "Compendium.impmal-core.items.Item.NNjqMA3cKTKOSgSp"].map(fromUuid))

let choice = await ItemDialog.create(items, 1, {title : this.item.name, text : "Select a Specialisation to receive 2 Advances"})

let item = choice[0].toObject();
item.system.advances = 2;

this.actor.createEmbeddedDocuments("Item", [item]);