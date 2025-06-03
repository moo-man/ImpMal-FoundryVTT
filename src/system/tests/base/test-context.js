import { OpposedTestMessageModel } from "../../../model/message/opposed";


export class TestContext
{
    // messageId = "";
    // rerolled = false;
    // speaker = {};
    // rollmode = "publicroll";
    // title = "";
    // fateReroll = false;
    // fateAddSL = false;
    tags = {};
    text = {};   
    targetSpeakers = [];
    responses = {}; // map of tokenIds to opposed messages
    appliedDamage = {}; // map of takenIds to {applied : boolean, msg : string}
    opposed = undefined; // message ID of opposed test this is defending against, if any
    resist = [];
    // uuid = ""; // Generic UUID variable used in subclasses

    constructor(context)
    {
        foundry.utils.mergeObject(this, context);
        // Add a push function to tags and text so they work sorta like an array but handles duplicates
        let push = function(value)
        {
            // Prevent duplicates when re-evaluating
            if (value)
            {
                this[value.slugify()] = value;
            }
        };

        Object.defineProperty(this.tags, "push", {
            value : push,
            enumerable : false
        });

        Object.defineProperty(this.text, "push", {
            value : push,
            enumerable : false
        });
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

    get token()
    {
        return this.actor.getActiveTokens()[0]?.document || this.actor.prototypeToken;
    }

    get targets() 
    {
        return this.targetSpeakers.map(speaker => 
        {
            return {
                id : speaker.token,
                test : game.messages.get(this.responses[speaker.token])?.system.test,
                unopposed : this.responses[speaker.token] == "unopposed",
                actor : ChatMessage.getSpeakerActor(speaker),
                damage : this.appliedDamage[speaker.token],
                token : game.scenes.get(speaker.scene)?.tokens.get(speaker.token),
                scene : speaker.scene
            };
        });
    }


    get item() 
    {
        if (this.itemUsed)
        {
            return fromUuidSync(this.itemUsed);
        }
        else 
        {
            return null;
        }
    }

    get itemTest()
    {
        let item = this.item;
        if (item?.type == "power")
        {
            return item.system.opposed;
        }
        else 
        {
            return item?.system.test || {};
        }
    }

    async formatItemSummary()
    {
        let item = this.item;
        let enriched = {
            player : await foundry.applications.ux.TextEditor.enrichHTML(item.system.notes.player, {async: true, relativeTo: item, secrets : false}),
            gm : await foundry.applications.ux.TextEditor.enrichHTML(item.system.notes.gm, {async: true, relativeTo: item, secrets : false})
        }
        return await renderTemplate("systems/impmal/templates/partials/item-use.hbs", {noImage : item.img == "icons/svg/item-bag.svg", enriched, item });
    }
    
    /**
     * Handle rerendering of opposed tests to ensure values are in sync (updating an attacker test should update the opposed result of the 
     * defender and vice versa, but should also prevent that update from causing an infinite loop of updating between attacker/defender
     * 
     * @param {Object} message Message for this context
     * @param {Object} fromUpdate Whether this call is from an message update, as opposed to create
     */
    async handleOpposed(message, fromUpdate=false)
    {
        if (game.user.isPrimaryGM)
        {
            let opposedMessage = this.findOpposedMessage();
            if (opposedMessage) // If defending
            {
                // Save attacking message for easy retrieval
                if (!this.opposed)
                {
                    this.opposed = opposedMessage.id;
                    this.actor.setFlag("impmal", "opposed", null);
                    this.saveContext(message);
                }

                opposedMessage.system.registerResponse(message)

                // let attackingTest = opposedMessage.attackerMessage.system.test;
                // attackingTest.context.addOpposedResponse(message.id);
                // attackingTest.sendToChat();
            }
            else if (this.targetSpeakers.length) // If attacking
            {
                if (Object.keys(this.responses).length != this.targetSpeakers.length)
                {
                    if (!fromUpdate)
                    {
                        await game.dice3d?.waitFor3DAnimationByMessageID(message.id);
                    }
                    // Add Opposing flags to each actor
                    for(let t of this.targets)
                    {
                        if (!this.responses[t.id])
                        {
                            let opposed = await OpposedTestMessageModel.createOpposed(message, t.token);
                            t.actor?.setFlag("impmal", "opposed", opposed.id);
                            this.registerOpposed(opposed.id, t.id)
                        }
                    }
                    await this.saveContext();
                }
                else 
                {
                    for(let id of Object.values(this.responses))
                    {
                        let opposed = game.messages.get(id);
                        if (opposed && (opposed.system.unopposed || opposed.system.defenderMessageId))
                        {
                            game.messages.get(id).system.renderContent();
                        }
                    }
                }
                // else 
                // {
                //     // Update each defending test
                //     this.targets.forEach(t => 
                //     {
                //         t.test?.sendToChat({updateOpposed: false});
                //     });
                // }
            }
        }
    }

    findAttackingMessage()
    {
        let opposed = this.findOpposedMessage();
        if (opposed)
        {
            return opposed.system.attackerMessage;
        }
    }

    findOpposedMessage()
    {
        // If this test is already rolled, the opposed ID is saved, so just retrieve it
        if (this.opposed)
        {
            return game.messages.get(this.opposed);
        }
        else // If new roll, take the opposed flag from the actor to find the message
        {
            let message = game.messages.get(this.actor.getFlag("impmal", "opposed"));
            return message;
        }
    }

    findDefendingMessage(tokenId)
    {
        return game.messages.get(test.context.responses[tokenId])?.system.defenderMessage;
    }


    // Called by a defending test to add target ID to context
    registerOpposed(opposedId, tokenId, {save=false}={})
    {
        this.responses[tokenId] = opposedId;
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
        canvas.scene.tokens.get(tokenId)?.actor.clearOpposed();
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

    saveContext(message)
    {
        let data = {
            system: {
                context: {...this}
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
        let context = foundry.utils.mergeObject({
            speaker : data.speaker,
            title : data.title,
            targetSpeakers : data.targets,
            rollMode : data.rollMode,
            itemUsed : data.itemUsed?.uuid,
            breakdownData : data.context.breakdown,
            superiorityUsed : data.useSuperiority
        }, data.context);
        log(`${this.prototype.constructor.name} - Context Data Retrieved`, {args : context});
        return context;
    }
}