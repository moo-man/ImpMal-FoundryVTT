import log from "../../logger";

export class TestContext
{
    messageId = "";
    rerolled = false;
    speaker = {};
    hidden = false;
    blind = false;
    title = "";

    constructor(context)
    {
        mergeObject(this, context);
    }

    get message() 
    {
        return game.messages.get(this.messageId);
    }

    set message(value)
    {
        this.messageId = value?.id;
    }

    get actor ()
    {
        return ChatMessage.getSpeakerActor(this.speaker);
    }

    static fromData(data) 
    {
        log(`${this.prototype.constructor.name} - Retrieving Context Data`, {args : data});
        let context = {
            speaker : data.speaker,
            title : data.title
        };
        log(`${this.prototype.constructor.name} - Context Data Retrieved`, {args : context});
        return context;
    }
}