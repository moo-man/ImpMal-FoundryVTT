let choice = await ItemDialog.create(ItemDialog.objectToArray(game.impmal.config.skills), 1, {title : this.effect.name, text : "Choose Implanted Skill"})

if (choice[0])
{
    this.effect.updateSource({name : this.effect.setSpecifier(choice[0].name), "flags.impmal.skill" : choice[0].id})
    this.item.updateSource({name : this.item.setSpecifier(choice[0].name)})
}