let spec = args.actor.items.get(args.data.skillItemId);
return (!spec || spec.system.skill != "rapport" || spec.name != "Inquiry")