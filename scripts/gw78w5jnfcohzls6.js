let location = this.item.system.location.value; // Get location chosen
let locationName = game.i18n.localize(this.actor.system.combat.hitLocations[location].label); // Get location label
let leg = location.split("Leg")[0]; // Get leg side - "left" or "right"

let injury = (await game.impmal.utility.findId("wBFH7XeivMbTrjhF")).toObject()
this.effect.updateSource({name : `${this.effect.name} (${locationName})`, "flags.impmal.leg" : leg});
this.item.updateSource({name : `${this.item.name} (${locationName})`});

injury.name = injury.name.split("(")[0] + `(${locationName})`
injury.system.location.value = location;

await this.actor.createEmbeddedDocuments("Item", [injury]);