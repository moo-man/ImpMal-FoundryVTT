let implanted = this.actor.items.get(this.item.flags.impmal?.weapon);

if (implanted)
{
  implanted.system.encumbrance.value = 0;
  implanted.system.traits.list = implanted.system.traits.list.filter(i => i.key != "twohanded")
}