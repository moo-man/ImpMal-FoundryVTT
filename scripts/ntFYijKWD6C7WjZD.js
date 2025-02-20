if (args.actor.system.species == "Daemon") {
args.locationData.formula = "0"
}

if (args.actor.system.warp?.charge > 0) {
args.modifiers.push({label : this.effect.name, value : args.actor.system.warp.charge})
}