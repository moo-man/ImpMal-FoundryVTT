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
    responses = {};

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
        return this.targetSpeakers.map(speaker => 
        {
            return {
                test : game.messages.get(this.responses[speaker.token])?.test, 
                actor : ChatMessage.getSpeakerActor(speaker)
            };
        });
    }

    async handleOpposed() 
    {
        let opposed = this.actor.getFlag("impmal", "opposed");
        
        if (opposed) // If this test is defending
        {
            this.actor.update({"flags.impmal.-=opposed" : null});
            // Call the attacking test and compute the result
            let attackTest = game.messages.get(opposed)?.test;
            await attackTest.context.addOpposedResponse(this.messageId);
            // Wait till the animation is finished before rendering the result
            await game.dice3d?.waitFor3DAnimationByMessageID(this.messageId);
            attackTest.roll();
        }

        // If attacking
        else if (!this.targetFlagsAdded)
        {
            return this.addTargetFlags();
        }
    }


    // Called by a defending test to add target ID to context
    addOpposedResponse(messageId, {save=false}={})
    {
        let token = game.messages.get(messageId).speaker.token;
        this.responses[token] = messageId;
        if(save)
        {
            return this.saveContext();
        }
    }


    async addTargetFlags()
    {
        if (game.user.isGM)
        {
            for(let target of this.targets)
            {
                await target.actor.setFlag("impmal", "opposed", this.messageId);
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