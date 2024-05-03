let location = this.item.system.location.value; // Get location chosen
let locationName = game.i18n.localize(this.actor.system.combat.hitLocations[location].label); // Get location label

this.item.updateSource({name : `${this.item.name} (${locationName})`});