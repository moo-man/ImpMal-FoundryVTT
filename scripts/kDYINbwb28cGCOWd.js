let item = (await fromUuid("Compendium.impmal-core.items.Item.1WGY0CCdLBdJx6se")).toObject();

item.name = "Kick";
item.img = this.item.img;
item.system.encumbrance.value = 0;

this.item.update(await this.effect.createAndEquipSlot(item));