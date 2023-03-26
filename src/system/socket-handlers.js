export class SocketHandlers
{
    static register()
    {
        game.socket.on("system.impmal", data => 
        {
            this[data.type]({...data.payload});
        });
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

}