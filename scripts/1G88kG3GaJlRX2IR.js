let injury = (await game.impmal.utility.findId("8GAejJkquUPdErQj")).toObject()
await this.actor.createEmbeddedDocuments("Item", [injury]);