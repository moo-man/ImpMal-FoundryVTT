this.actor.system.combat.armourModifier += this.actor.system.characteristics.tgh.bonus
if (this.actor.system.characteristics.tgh.bonus > this.actor.system.characteristics.str.bonus)
{
   this.actor.system.combat.speed.land.modifier--; 
}