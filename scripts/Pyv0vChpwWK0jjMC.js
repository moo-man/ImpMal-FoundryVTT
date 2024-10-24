        let locations = Object.keys(args.actor.system.combat.hitLocations).map(k => 
        {
            return {id : k, name : game.i18n.localize(args.actor.system.combat.hitLocations[k].label)};
        });
        
        let location = (await ItemDialog.create(locations, 1))[0].id;
        mergeObject(args.locationData, args.actor.system.combat.hitLocations[location]);