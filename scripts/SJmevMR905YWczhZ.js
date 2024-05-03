let roll = Math.ceil(CONFIG.Dice.randomUniform() * 10);
let newSpeed = ""
if (roll <= 4)
{
	newSpeed = "slow"
}
else if (roll <= 7)
{
	newSpeed = "normal";
}
else if (roll <= 10)
{
	newSpeed = "fast"
}

this.actor.update({"system.combat.speed.land.value" : newSpeed});

this.script.scriptMessage(`<a class="inline-roll"><i class="fa-solid fa-dice-d10"></i>${roll}</a>: ${game.impmal.config.speeds[newSpeed]}`)