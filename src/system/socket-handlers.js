export class SocketHandlers
{
    static register()
    {
        game.socket.on("system.impmal", data => 
        {
            this[data.type]({...data.payload}, data.userId);
        });
    }

    static call(type, payload, userId)
    {
        game.socket.emit("system.impmal", {type, payload, userId});
    }

    static addTargetFlags({id}={})
    {
        if (game.user.isGM)
        {
            game.messages.get(id)?.test?.context.addTargetFlags();
        }
    }

    static updateActor({speaker, update}={})
    {
        if (game.user.isGM)
        {
            ChatMessage.getSpeakerActor(speaker)?.update(update);
        }
    }

    static updateMessage({id, data}={})
    {
        if (game.user.isGM)
        {
            game.messages.get(id)?.update(data);
        }
    }

    static rerenderMessages({ids}={})
    {
        if (game.user.isGM)
        {
            ids.forEach(id => 
            {
                game.messages.get(id)?.test?.evaluate(true);
            });
        }
    }

    static rollItemTest({documentUuid, itemUuid}, userId)
    {
        if (game.user.id == userId)
        {
            fromUuid(documentUuid).then(actor => 
            {
                actor.setupTestFromItem(itemUuid);
            });
        }
    }

    /**
     * Not used by sockets directly, but is called when a socket handler should be executed by
     * the specific user which owns a document. Usually used to invoke tests from other users
     * for their assigned Actor. 
     * 
     * @param {Document} document Document on which to test if the user is owner or not
     * @param {String} type Type of socket handler
     * @param {Object} payload Data for socket handler, should generally include document UUID 
     * @returns 
     */
    static executeOnOwner(document, type, payload)
    {
        let ownerUserId = game.users.find(u => u.active && u.character?.id == document.id)?.id;

        if (!ownerUserId) // If no owner found, assign to GM (important if this user isn't a GM)
        {
            ownerUserId = game.users.find(u => u.active && u.isGM)?.id;
        }

        if (!ownerUserId)
        {
            return ui.notifications.error(game.i18n.localize("IMPMAL.NoOWnerOrGMFound"));
        }
                                            
        if (ownerUserId == game.user.id)
        {
            this[type](payload, ownerUserId);
        }
        else // If userID isn't self,  
        {
            SocketHandlers.call(type, payload, ownerUserId);
        }
    }

}