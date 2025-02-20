let choice = await ItemDialog.create(ItemDialog.objectToArray({"hereticus" : "Ordo Hereticus", "malleus" : "Ordo Malleus", "xenos" : "Ordo Xenos"}, this.item.img), 1, {title : this.item.name, text :  "Select Ordo"})

if (choice.length)
{
	this.item.updateSource({name : choice[0].name})
}