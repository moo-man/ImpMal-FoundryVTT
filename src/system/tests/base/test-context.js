import log from "../../logger";
import { SocketHandlers } from "../../socket-handlers";

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
    responses = {}; // map of tokenIds to response messages or "unopposed" string
    appliedDamage = {}; // map of takenIds to {applied : boolean, msg : string}
    defendingAgainst = undefined;

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
                id : speaker.token,
                test : game.messages.get(this.responses[speaker.token])?.test,
                unopposed : this.responses[speaker.token] == "unopposed",
                actor : ChatMessage.getSpeakerActor(speaker),
                damage : this.appliedDamage[speaker.token]
            };
        });
    }

    async handleOpposed() 
    {
        let opposedId = this.actor.getFlag("impmal", "opposed");

        if (opposedId) // If this test is defending (first render)
        {
            this.actor.update({"flags.impmal.-=opposed" : null});
            // Call the attacking test and compute the result
            let attackTest = game.messages.get(opposedId)?.test;
            if (attackTest)
            {
                this.defendingAgainst = opposedId;
                await this.saveContext();
                await attackTest.context.addOpposedResponse(this.messageId);
                // Wait till the animation is finished before rendering the result
                await game.dice3d?.waitFor3DAnimationByMessageID(this.messageId);
                attackTest.roll();
            }
        }

        else if (this.defendingAgainst) // If this test is defending (2nd+ render, actor flag doesn't exist anymore)
        {
            this.rerenderTargets();
        }

        // If attacking
        else if (this.targetSpeakers.length)
        {
            // First message - add flags to targets designating them as being attacked
            if (!this.targetFlagsAdded)
            {
                return this.addTargetFlags();
            }

            // Subsequent calls - Tell target messages to rerender
            else 
            {
                return this.rerenderTargets();
            }
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

    // Set a particular token to unopposed
    addUnopposedResponse(tokenId, {save=false}={})
    {
        this.responses = foundry.utils.deepClone(this.responses);
        this.responses[tokenId] = "unopposed";
        if(save)
        {
            return this.saveContext();
        }
    }

    //Set all tokens that haven't responded as unopposed 
    fillUnopposed({save = false}={})
    {
        for(let speaker of this.targetSpeakers)
        {
            if (!this.responses[speaker.token])
            {
                this.addUnopposedResponse(speaker.token);
                this.removeOpposedFlag(speaker);
            }
        }
        if (save)
        {
            return this.saveContext();
        }
    }

    // Set damage as applied for a given target ID
    setApplied(id, data, {save=false}={})
    {   
        let multiple = 1; // How many times damage has been applied for a given id

        if (this.appliedDamage[id])
        {
            multiple = (this.appliedDamage[id].multiple || 0) + 1;
        }

        this.appliedDamage[id] = mergeObject({applied : true, multiple}, data);
        if (save)
        {
            return this.saveContext();
        }
    }

    removeOpposedFlag(speaker)
    {
        let update = {"flags.impmal.-=opposed" : null};
        if (game.user.isGM)
        {
            let actor = ChatMessage.getSpeakerActor(speaker);
            if (actor)
            {
                return actor.update(update);
            }
        }
        else 
        {
            SocketHandlers.call("updateActor", {speaker, update});
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
            SocketHandlers.call("addTargetFlags", {id : this.messageId});
        }
        game.user.updateTokenTargets([]);
    }

    async rerenderTargets()
    {
        if (game.user.isGM)
        {
            // Targets
            for(let target of this.targets)
            {
                target.test?.evaluate(true);
            }

            // Attacker
            if (this.defendingAgainst)
            {
                game.messages.get(this.defendingAgainst)?.test.evaluate(true);
            }
        }
        else 
        {
            SocketHandlers.call("rerenderMessages", {ids : Object.values(this.responses).concat(this.defendingAgainst || [])});
        }
        game.user.updateTokenTargets([]);
    }



    saveContext()
    {
        let data = {
            flags: {
                impmal : {
                    test : {
                        context: {...this}
                    }
                }
            }
        };
        if (game.user.isGM || this.message.isAuthor)
        {
            return this.message?.update(data);
        }
        else 
        {
            SocketHandlers.call("updateMessage", {id : this.message.id, data});
        }
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