import ZoneHelpers from "./zone-helpers";

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
            return game.messages.get(id)?.test?.context.addTargetFlags();
        }
    }

    static updateActor({speaker, update}={})
    {
        if (game.user.isGM)
        {
            return ChatMessage.getSpeakerActor(speaker)?.update(update);
        }
    }

    static updateMessage({id, data}={})
    {
        if (game.user.isGM)
        {
            return game.messages.get(id)?.update(data);
        }
    }

    static updateDrawing({uuid, data}={})
    {
        if (game.user.isGM)
        {
            return fromUuidSync(uuid).update(data);
        }
    }

    static rerenderMessages({ids}={})
    {
        if (game.user.isGM)
        {
            ids.forEach(id => 
            {
                return game.messages.get(id)?.test?.evaluate(true);
            });
        }
    }

    static rollItemTest({documentUuid, itemUuid}, userId)
    {
        if (game.user.id == userId)
        {
            fromUuid(documentUuid).then(actor => 
            {
                return actor.setupTestFromItem(itemUuid);
            });
        }
    }
    
    static applyEffect({effectUuids, actorUuid, messageId}, userId)
    {
        if (game.user.id == userId)
        {
            return fromUuidSync(actorUuid)?.applyEffect(effectUuids, messageId);
        }  
    }

    static applyZoneEffect({effectUuids, drawingUuid, messageId}, userId)
    {
        if (game.user.id == userId)
        {
            return ZoneHelpers.applyEffectToZone(effectUuids, messageId, fromUuidSync(drawingUuid));
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
        let ownerUser = game.impmal.utility.getActiveDocumentOwner(document);
        if (game.user.id == ownerUser.id)
        {
            return this[type](payload);
        }
        ui.notifications.notify(game.i18n.format("IMPMAL.SendingSocketRequest", {name : ownerUser.name}));
        SocketHandlers.call(type, payload, ownerUser.id);
    }

}