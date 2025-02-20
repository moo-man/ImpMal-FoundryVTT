if (this.effect.getFlag("impmal", "rolled"))
	return

let table = await fromUuid("Compendium.impmal-inquisition.tables.RollTable.Dy8XzuHFhHpVFytC");

let result = await table.roll();

this.script.message(result.results[0].text);


this.effect.setFlag("impmal", "rolled", true)