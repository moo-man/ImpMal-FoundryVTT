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
    responses = {}; // map of tokenIds to response messages or "unopposed" string
    appliedDamage = {}; // map of takenIds to {applied : boolean, msg : string}
    defendingAgainst = undefined; // message ID of attacking test

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


    
    /**
     * First handling of opposed values
     * 
     * @param {Object} message Message for this context
     * @param {Object} options.updateOpposed Prevent infinite update loop between attacking and defending tests
     */
    async handleOpposed(message, {updateOpposed=true}={})
    {
        if (game.user.isGM && updateOpposed)
        {
            let attackingMessage = this.findAttackingMessage();
            if (attackingMessage) // If defending
            {
                // Save attacking message for easy retrieval
                if (!this.defendingAgainst)
                {
                    this.defendingAgainst = attackingMessage.id;
                    this.saveContext();
                }

                let attackingTest = attackingMessage.test;
                attackingTest.context.addOpposedResponse(message.id);
                attackingTest.sendToChat();
            }
            else if (this.targetSpeakers.length) // If attacking
            {
                // Update each defending test
                this.targets.forEach(t => 
                {
                    t.test?.sendToChat({updateOpposed: false});
                });
            }
        }
    }

    /**
     * Scan the previous messages and search for any message that is targeting the token of this test
     */
    findAttackingMessage()
    {
        // If attacking message was previously found, use that message
        if (this.defendingAgainst)
        {
            return game.messages.get(this.defendingAgainst);
        }

        // Otherwise, scan previous messages
        let startingIndex = this.messageId ? 
            game.messages.contents.findIndex(m => m.id == this.messageId) : // Not first call, start at this message's index
            (game.messages.contents.length - 1);                            // First check - start at latest message 

        //  Search preivous 25 messages to check if there's an attacking message
        for(let i = startingIndex - 1; (i >= 0 && i > startingIndex - 25); i--)        
        {
            let message = game.messages.contents[i];
            let test = message.test;
            if (test)
            {
                let target = test.context.targetSpeakers.find(t => t.token == this.speaker.token);
                let hasResponded = test.context.responses[this.speaker.token];
                if (target && !hasResponded) // Do not include messages that already have a response from this token
                {
                    return message;
                }
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
            throw new Error("Player cannot save non-owned test context.");
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