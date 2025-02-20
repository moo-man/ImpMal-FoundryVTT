let effects = [this.actor.hasCondition("fatigued"), this.actor.hasCondition("unconscious")].filter(i => i);

if (effects.length)
{

	let update = effects.map(i => { return {_id : i.id, disabled : false}});

	this.actor.update({effects : update})

	this.script.notification("Re-enabling " + effects.map(i => i.name).join(", "));

}