        let skills = (await Promise.all(["0WV8IJuVkxLdOuem", "1OMDatjP2PW1oufq", "z3pFUwFlp4BJf1oJ"].map(game.impmal.utility.findId)))
            .filter(i => !this.actor.itemTypes.specialisation
                .find(actorSkill => actorSkill.name == i.name && actorSkill.system.skill == i.system.skill))
            .map(i => i.toObject());
        skills.forEach(i => 
        {
            i.name = game.impmal.config.skills[i.system.skill] + " (Forbidden) ";
	    i.id = i._id;
        });

        let choice = await ItemDialog.create(skills, 1);

	choice[0].name = "Forbidden"

        this.actor.createEmbeddedDocuments("Item", choice);