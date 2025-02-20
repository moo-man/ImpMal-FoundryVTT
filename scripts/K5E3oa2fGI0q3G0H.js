let item = await fromUuid("Compendium.impmal-core.items.Item.0WV8IJuVkxLdOuem");

let data = item.toObject()
data.system.advances = 1;

let spec = await ValueDialog.create({title : this.item.name, text : "Enter Lore Specialisation related to Illisear’s daemonic presence"});

if (spec)
{
	data.name = spec;
}

await this.actor.createEmbeddedDocuments("Item", [data]);