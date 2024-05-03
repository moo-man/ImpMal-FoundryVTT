    let weapons = await Promise.all(["2XMWybp4AQqoEPtI", "blRx8XLXQaD9sjDz", "BoWOcsxxSvrGIefL", "ix1RLHT1T5rd0Egu", "hlcxzIxPsc6fXOhJ", "HQ4thlBy0uFtXo13"].map(game.impmal.utility.findId));

    let choice = (await DocumentChoice.create(weapons, 1, {text : "Choose a weapon for the specialist to use"})).map(i => i.toObject())

    if (choice && choice.length)
    {
        let lasgun = await this.actor.items.getName("Lasgun")?.delete();
	choice[0].sort = lasgun?.sort
        await this.actor.createEmbeddedDocuments("Item", choice);
    }