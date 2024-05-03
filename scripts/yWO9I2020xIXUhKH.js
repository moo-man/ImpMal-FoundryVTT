let location = this.item.system.location.value; // Get location chosen
let locationName = game.i18n.localize(this.actor.system.combat.hitLocations[location].label); // Get location label
let hand = location.split("Arm")[0]; // Get hand side - "left" or "right"

let injury = (await game.impmal.utility.findId("cHYtB7pCpwTOW1We")).toObject()
this.effect.updateSource({name : `${this.effect.name} (${locationName})`, "flags.impmal.hand" : hand});
this.item.updateSource({name : `${this.item.name} (${locationName})`});

injury.name = injury.name.replace("Finger", locationName.split(" ")[0] + " Finger");
injury.system.location.value = location;

await this.actor.createEmbeddedDocuments("Item", [injury]);