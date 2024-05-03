let teeth = (await game.impmal.utility.findId("GvHZsCJUIJ32TVhe")).toObject();

let teethRoll = new Roll("1d10");
await teethRoll.roll();

teethRoll.toMessage({speaker : {alias : this.effect.name}, flavor : "Teeth Lost"});

teeth.name = teeth.name.replace("Teeth", `${teethRoll.total} Teeth`);

this.actor.createEmbeddedDocuments("Item", [teeth]);