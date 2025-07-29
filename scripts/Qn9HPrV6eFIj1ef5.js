let effectsToDisable = this.actor.itemTypes.critical.concat(this.actor.itemTypes.injury).reduce((effects, item) => effects.concat(item.effects.contents), []).filter(e => e.transfer);

if (effectsToDisable.length)
{
    this.script.notification(`Disabling ${effectsToDisable.map(i => i.name).join(", ")}.`);
    effectsToDisable.forEach(i => i.update({disabled : true}));
}