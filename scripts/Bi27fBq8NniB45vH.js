        let location = this.item.system.location.value; // Get location chosen
        let locationName = game.i18n.localize(this.actor.system.combat.hitLocations[location].label); // Get location label
        let hand = location.split("Arm")[0]; // Get hand side - "left" or "right"

        let injury = (await game.impmal.utility.findId("bHbJPwCbgCVkCbif")).toObject()
        this.effect.updateSource({name : `${this.effect.name} (${locationName})`, "flags.impmal.hand" : hand});
        this.item.updateSource({name : `${this.item.name} (${locationName})`});

        injury.name = injury.name.split("(")[0] + `(${locationName})`
        injury.system.location.value = location;
        

        let roll = new Roll("max(1d10 - 5, 0)");
        await roll.roll();

        roll.toMessage({speaker : {alias : this.item.name}, flavor : "Fingers Lost"})

        let amputation
        if (roll.total > 0)
        {
            amputation = (await game.impmal.utility.findId("cHYtB7pCpwTOW1We")).toObject()
            amputation.system.location.value = location;
            setProperty(amputation, "flags.impmal.lostFingers", roll.total);
            amputation.name = amputation.name.replace("Finger", `${roll.total} ${locationName.split(" ")[0]} Finger` + (roll.total > 1 ? "s" : ""));
        }

        if (this.actor.type == "character")
        {
            await this.actor.update(this.actor.system.hands.toggle(hand));
        }

        await this.actor.createEmbeddedDocuments("Item", [injury, amputation].filter(i => i));