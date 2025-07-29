if (this.item.system.traits.has("twohanded") && this.item.system.isEquipped)
{
  this.item.system.damage.value++;
  this.item.system.traits.add("penetrating", {modify: true})
}