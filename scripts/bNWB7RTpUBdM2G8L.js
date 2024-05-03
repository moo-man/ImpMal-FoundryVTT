let location = this.item.system.location.value; // Get location chosen
let locationName = game.i18n.localize(this.actor.system.combat.hitLocations[location].label); // Get location label
let hand = location.split("Arm")[0]; // Get hand side - "left" or "right"
this.item.updateSource({name : `${this.item.name} (${locationName})`});
if (this.actor.type == "character")
{
    await this.actor.update(this.actor.system.hands.toggle(hand));
}