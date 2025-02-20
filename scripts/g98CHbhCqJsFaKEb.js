let effects = this.item.effects.contents.filter(i => i.id != this.effect.id);

let choice = await ItemDialog.create(effects, 1, {title : this.effect.name, text : "Choose Drug"})

let duration = Math.ceil(CONFIG.Dice.randomUniform() * 10)

let effect = choice[0].convertToApplied();

effect.duration.rounds = duration;

effect.origin = this.item.uuid;

this.actor.applyEffect({effectData : [effect]})