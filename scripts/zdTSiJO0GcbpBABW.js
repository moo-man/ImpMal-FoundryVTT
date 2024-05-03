let injury = (await game.impmal.utility.findId("BUjBUUB42vTh3aKD")).toObject()

injury.name = injury.name.split("(")[0] + `(Hip)`
injury.system.location.value = "rightLeg"; // Arbitrary

await this.actor.createEmbeddedDocuments("Item", [injury]);