import log from "../../logger";

export class TestContext
{
    messageId = "";
    rerolled = false;
    speaker = {};
    rollmode = "publicroll";
    title = "";
    fateReroll = false;
    fateAddSL = false;
    targetSpeakers = [];
    responses = [];

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

    get targets() 
    {
        return this.targetSpeakers.map(ChatMessage.getSpeakerActor);
    }

    handleOpposed() 
    {
        let opposed = this.actor.getFlag("impmal", "opposed");
        if (opposed) // If this test is defending
        {
            // Call the attacking test and compute the result
            let attackTest = game.messages.get(opposed)?.test;
            attackTest.context.addOpposedResponse(this.messageId);
            attackTest.roll();
            this.actor.update({"flags.impmal.-=opposed" : null});
        }

        // If attacking
        else if (!this.targetFlagsAdded)
        {
            return this.addTargetFlags();
        }
    }


    // Called by a defending test to add response ID to context
    addOpposedResponse(messageId, {save=false}={})
    {
        this.responses = this.responses.concat(messageId);
        if(save)
        {
            return this.saveContext();
        }
    }


    async addTargetFlags()
    {
        if (game.user.isGM)
        {
            for(let actor of this.targets)
            {
                await actor.setFlag("impmal", "opposed", this.messageId);
            }

            this.targetFlagsAdded = true;
            this.saveContext();
        }
        else 
        {
            game.socket.on("system.impmal", {type: "addTargetFlags", payload : {id : this.messageId}});
        }
    }


    saveContext()
    {
        this.message?.update({
            flags: {
                impmal : {
                    context: this
                }
            }
        });
    }

    static fromData(data) 
    {
        log(`${this.prototype.constructor.name} - Retrieving Context Data`, {args : data});
        let context = {
            speaker : data.speaker,
            title : data.title,
            fateReroll : data.fateReroll,
            fateAddSL : data.fateAddSL,
            targetSpeakers : data.targets.map(i => ChatMessage.getSpeaker({token : i.document})),
            rollmode : data.rollmode,
        };
        log(`${this.prototype.constructor.name} - Context Data Retrieved`, {args : context});
        return context;
    }
}