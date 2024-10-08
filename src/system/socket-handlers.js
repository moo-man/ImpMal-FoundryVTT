
export  default socketHandlers = {

    addTargetFlags({id}={})
    {
        if (game.user.isPrimaryGM)
        {
            return game.messages.get(id)?.test?.context.addTargetFlags();
        }
    },

    rerenderMessages({ids}={})
    {
        if (game.user.isPrimaryGM)
        {
            ids.forEach(id => 
            {
                return game.messages.get(id)?.test?.evaluate(true);
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
    }
    
}