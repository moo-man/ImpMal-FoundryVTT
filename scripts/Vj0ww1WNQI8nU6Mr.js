let weapons = await Promise.all(["id1", "id2", "id3"].map(fromUuid))

let choice = await ItemDialog.create(weapons, 1);

this.actor.createEmbeddedDocuments("Item", choice);