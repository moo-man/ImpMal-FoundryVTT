if (!this.effect.getFlag("impmal", "bleedingRemoved"))
{
  return;
}

let add = await foundry.applications.api.Dialog.confirm({
  window : {title : this.effect.name},
  content : "<p>Re-Apply Bleeding Condition?</p>"
})

if (add)
{
  this.actor.addCondition("bleeding");
}