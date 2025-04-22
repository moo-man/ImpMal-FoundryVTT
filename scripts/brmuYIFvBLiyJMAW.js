let roll = await new Roll("1d10").roll();

roll.toMessage(this.script.getChatData());

let id = "";

if (roll.total <= 2) {
	id = "PfXGe3rP8mElC0zQ";
}
else if (roll.total <= 4) {
	id = "SWqlUm4T961rMNxh";
}
else if (roll.total <= 6) {
	id = "R1fsXlhlP0dLgmY5";
}
else if (roll.total <= 8) {
	id = "zgESaECCszKA9lVC";
}
else if (roll.total <= 10) {
	id = "UNO1NAeTdu1VFRYK";
}

let effect = this.effect.sourceItem.effects.get(id);

this.actor.applyEffect({effects : effect});