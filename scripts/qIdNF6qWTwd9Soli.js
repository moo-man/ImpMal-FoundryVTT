let action = await ItemDialog.create(ItemDialog.objectToArray(game.impmal.config.vehicleActions).map(i => {i.name = i.name.name; return i}), 1, {title : this.effect.name, text : "Select an Action"})

if (action[0])
{
  this.item.updateSource({name : this.item.setSpecifier(action[0].name), "flags.impmal.action" : action[0].id})  
}