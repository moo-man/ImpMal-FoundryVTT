        let psyker = await game.impmal.utility.findId("3GLGsYiH5LiKgYjE");
        let powers = (await game.impmal.utility.getAllItems("power")).filter(i => i.system.discipline == "minor");
        let power = powers[Math.floor(CONFIG.Dice.randomUniform() * powers.length)]?.toObject();
        this.script.scriptNotification(`Gained ${power.name}`);
        psyker = psyker.toObject();
        psyker.effects = [];
        this.actor.createEmbeddedDocuments("Item", [psyker, power]);