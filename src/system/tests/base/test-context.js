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
    opposedFlagsAdded = false;

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
     * Handle rerendering of opposed tests to ensure values are in sync (updating an attacker test should update the opposed result of the 
     * defender and vice versa, but should also prevent that update from causing an infinite loop of updating between attacker/defender
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
                    this.actor.setFlag("impmal", "opposed", null);
                    this.saveContext(message);
                }

                let attackingTest = attackingMessage.test;
                attackingTest.context.addOpposedResponse(message.id);
                attackingTest.sendToChat();
            }
            else if (this.targetSpeakers.length) // If attacking
            {
                if (!this.opposedFlagsAdded)
                {
                    // Add Opposing flags to each actor
                    this.targets.forEach(t => 
                    {
                        t.actor?.setFlag("impmal", "opposed", message.id);
                    });
                    this.opposedFlagsAdded = true;
                    this.saveContext();
                }
                else 
                {
                    // Update each defending test
                    this.targets.forEach(t => 
                    {
                        t.test?.sendToChat({updateOpposed: false});
                    });
                }
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
        else // Take the opposed flag from the actor to find the message
        {
            let message = game.messages.get(this.actor.getFlag("impmal", "opposed"));
            return message;
        }
    }

    findDefendingMessage(tokenId)
    {
        return game.messages.get(test.context.responses[tokenId]);
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

    saveContext(message)
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
            return (message || this.message)?.update(data);
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