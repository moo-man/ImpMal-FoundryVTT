let injury = (await game.impmal.utility.findId("QAcwzyxchW3ihCfd")).toObject()
await this.actor.createEmbeddedDocuments("Item", [injury]);