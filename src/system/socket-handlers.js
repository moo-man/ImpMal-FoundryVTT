
export  default socketHandlers = {

    addTargetFlags({id}={})
    {
        if (game.user.isPrimaryGM)
        {
            return game.messages.get(id)?.system.test?.context.addTargetFlags();
        }
    },

    rerenderMessages({ids}={})
    {
        if (game.user.isPrimaryGM)
        {
            ids.forEach(id => 
            {
                return game.messages.get(id)?.system.test?.evaluate(true);
            });
        }
    },
    rollItemTest({documentUuid, itemUuid}, userId)
    {
        if (game.user.id == userId)
        {
            fromUuid(documentUuid).then(actor => 
            {
                return actor.setupTestFromItem(itemUuid);
            });
        }
    },

    createActor(data) 
    {
        if (game.user.id == game.users.activeGM?.id)
        {
            let id = data.fromId;
            let actorData = data.actor;
            // Give ownership to requesting actor
            actorData.ownership = {
                default: 0,
                [id]: 3
            };
            // We want the user to add items, not the GM (for prompting scripts)
            return Actor.implementation.create(actorData, {keepId : true, itemsToAdd : data.items});
        }
    }
    
}