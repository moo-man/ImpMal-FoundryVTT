let weapons = this.actor.itemTypes.weapon.filter(i => i.system.spec == "pistol");

if (!weapons.length)
{
  return this.script.notification("No eligible weapons (pistols) on this Actor.", "error")
}
else
{
  let chosen = await ItemDialog.create(weapons, 1, {title: this.effect.name, text : "Choose Weapon"})

  if (chosen[0])
  {
    this.item.update({name : this.item.setSpecifier(chosen[0].name)})
  }
}