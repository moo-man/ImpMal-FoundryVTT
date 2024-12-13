let activator = this.effect.sourceTest.item.effects.get("8boaDtDEpNK5cyFJ") // Activation effect;

let effectData = activator.toObject();

args.options.keepId = true;
effectData.flags.impmal.linkedEffect = this.effect.uuid;
effectData.statuses = ["lifeLeech"];

this.effect.sourceActor.applyEffect({effectData : [effectData]});