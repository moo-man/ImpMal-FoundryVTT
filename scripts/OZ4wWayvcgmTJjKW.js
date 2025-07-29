if (args.equipped && !this.item.getFlag("impmal", "weapon")) 
{

  let weapon = await DragDialog.create({ text: "Provide the Weapon to be implanted", title: this.effect.name, filter: (item) => item.type == "weapon" && item.system.encumbrance.value <= 3, onError: "Must provide a Weapon with 3 or less Encumbrance." })

  let hitLocations = [{ id: "none", name: "None" }].concat(Object.keys(this.actor.system.combat.hitLocations).map(loc => { return { id: loc, name: game.i18n.localize(this.actor.system.combat.hitLocations[loc].label) } }))

  let location = (await ItemDialog.create(hitLocations, 1, { title: this.effect.name, text: "Select a Hit Location" }))[0]

  let specifier = weapon.name;
  if (location.id != "none") 
  {
    specifier += ` - ${location.name}`;
  }



  let slots = {
    number : 1,
    list : []
  }

  // Item already owned
  if (weapon.parent?.uuid == this.actor.uuid)
  {
    slots.list = [{uuid : weapon.uuid, name : weapon.name, id : weapon.id}];
  }
  else 
  {
    slots = (await this.effect.createAndEquipSlot(weapon))["system.slots"]
  }

  this.item.update({
    name: this.item.setSpecifier(specifier),
    "flags.impmal": { location: location.id, implanted: true, weapon : slots.list[0].id },
    "system.slots" : slots
  });

}