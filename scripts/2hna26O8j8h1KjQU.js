        let item = this.actor.itemTypes.specialisation.find(i => i.name == "Psyniscience") || (await game.impmal.utility.findId("lBzdm76EnuuoGfMq"));

        let data = item.toObject();

        data.system.advances++;
	this.script.scriptNotification("Advanced Psyniscience");
        this.actor.update({items : [data]});