    let location = this.item.system.location.value; // Get location chosen
    let locationName = game.i18n.localize(this.actor.system.combat.hitLocations[location].label); // Get location label
    let leg = location.split("Leg")[0]; // Get leg side - "left" or "right"
    
    let injury = (await game.impmal.utility.findId("uxP0TpajJLHgBfpL")).toObject()
    this.effect.updateSource({name : `${this.effect.name} (${locationName})`, "flags.impmal.leg" : leg});
    this.item.updateSource({name : `${this.item.name} (${locationName})`});
    
    injury.name = injury.name.split("(")[0] + `(${locationName})`
    injury.system.location.value = location;
    
    
    let roll = new Roll("max(1d10 - 5, 0)");
    await roll.roll();
    
    roll.toMessage({speaker : {alias : this.item.name}, flavor : "Toes Lost"})
    
    let amputation
    if (roll.total > 0)
    {
        amputation = (await game.impmal.utility.findId("wBFH7XeivMbTrjhF")).toObject()
        amputation.system.location.value = location;
        amputation.name = amputation.name.replace("Toes", `${roll.total} ${locationName.split(" ")[0]} Toe` + (roll.total > 1 ? "s" : ""));
        setProperty(amputation, "flags.impmal.lostToes", roll.total)
    }
    
    await this.actor.createEmbeddedDocuments("Item", [injury, amputation].filter(i => i));
