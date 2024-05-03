 	let location = Math.ceil(CONFIG.Dice.randomUniform() * 2) == 1 ? "leftArm" : "rightArm"  // Get location chosen
        let locationName = game.i18n.localize(this.actor.system.combat.hitLocations[location].label); // Get location label
        let hand = location.split("Arm")[0]; // Get hand side - "left" or "right"

        let injury = (await game.impmal.utility.findId("FqNmgPQo3it7Wlgf")).toObject()
        this.effect.updateSource({name : `${this.effect.name} (${locationName})`, "flags.impmal.hand" : hand});
        this.item.updateSource({name : `${this.item.name} (${locationName})`});

        injury.name = injury.name.split("(")[0] + `(${locationName})`
        injury.system.location.value = location;

        if (this.actor.type == "character")
        {
            await this.actor.update(this.actor.system.hands.toggle(hand));
        }

        await this.actor.createEmbeddedDocuments("Item", [injury]);