let injury = (await game.impmal.utility.findId("3i9nky5HtLkB0PCz")).toObject()
await this.actor.createEmbeddedDocuments("Item", [injury]);