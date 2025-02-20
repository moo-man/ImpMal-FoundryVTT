let item = await fromUuid("Compendium.impmal-core.items.Item.z3pFUwFlp4BJf1oJ");

let data = item.toObject()
data.system.advances = 1;

let spec = await ValueDialog.create({title : this.item.name, text : "Enter Linguistics Specialisation based on the xenos species you are familiar with."});

if (spec)
{
	data.name = spec;
}

await this.actor.createEmbeddedDocuments("Item", [data]);