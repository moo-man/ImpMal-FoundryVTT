let injury = (await game.impmal.utility.findId("b2oWmRETjNtrzEij")).toObject()
await this.actor.createEmbeddedDocuments("Item", [injury]);