let spec = args.actor.items.get(args.data.skillItemId);
return (!spec || spec.system.skill != "presence" || (spec.name != "Interrogation" && spec.name != "Intimidation"))