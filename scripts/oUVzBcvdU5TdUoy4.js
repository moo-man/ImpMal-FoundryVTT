let item = (await fromUuid("Compendium.impmal-core.items.Item.1LgXZfag35FhcNoj")).toObject()
item.name = "Stablight"
this.item.update(await this.effect.createAndEquipSlot(item));