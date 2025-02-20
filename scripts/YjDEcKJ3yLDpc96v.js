let item = await fromUuid("Compendium.impmal-core.items.Item.bS4Uy21y8pkp7I7P");

let sword = item.toObject();

sword.name = this.item.setSpecifier("Melee");
sword.system.encumbrance = 0;
sword.system.traits.list = [{key : "twohanded"}, {key : "defensive"}]

sword.system.spec = "twoHanded"

this.item.update(await this.effect.createAndEquipSlot(sword));