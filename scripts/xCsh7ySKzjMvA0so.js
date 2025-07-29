let implanted = this.actor.items.get(this.item.flags.impmal?.weapon);
let location = this.item.flags.impmal?.location

if (implanted && location != "none")
{
  this.actor.system.combat.hitLocations[location].label = implanted.name;
  this.actor.system.combat.hitLocations[location].armour = implanted._source.system.encumbrance.value;
  this.actor.system.combat.hitLocations[location].sources = [{name : this.effect.name, value : implanted._source.system.encumbrance.value}];
}