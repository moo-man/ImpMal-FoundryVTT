let arm = this.item.getFlag("impmal", "arm");

if (arm)
{
  let armourDiff = 2 - this.actor.system.combat.hitLocations[arm].armour 
  if (armourDiff > 0)
  {
    this.actor.system.combat.hitLocations[arm].armour += armourDiff;
    this.actor.system.combat.hitLocations[arm].sources = [{name : this.effect.name, value : armourDiff}]
  }
}