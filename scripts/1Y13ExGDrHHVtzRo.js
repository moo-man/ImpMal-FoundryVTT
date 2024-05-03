let effects = [];
effects.push(this.actor.hasCondition("bleeding"))
effects.push(this.actor.hasCondition("frightened"))
effects.push(this.actor.hasCondition("stunned"))
effects.push(this.actor.hasCondition("unconscious"))
await this.actor.deleteEmbeddedDocuments("ActiveEffect", effects.filter(e => e).map(e => e.id))

this.actor.applyDamage(Math.max(0, 4 - this.effect.sourceTest?.result?.SL), {ignoreAP : true})