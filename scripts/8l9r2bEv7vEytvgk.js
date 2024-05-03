let spec = args.actor.items.get(args.data.skillItemId);
return (!spec || spec.system.skill != "lore" || spec.name != "Forbidden")