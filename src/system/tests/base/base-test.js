import { OpposedTestResult } from "../opposed-result";
import { BaseTestEvaluator } from "./base-evaluator";
import { TestContext } from "./test-context";

export class BaseTest 
{

    static contextClass = TestContext;
    static evaluatorClass = BaseTestEvaluator;
    rollTemplate = "systems/impmal/templates/chat/rolls/roll.hbs";
    testDetailsTemplate = "";
    itemDetailsTemplate = "";

    constructor({data, context})
    {
        this.data = mergeObject(data, this._defaultData(), {overwrite : false, recursive : true});

        this.context = new this.constructor.contextClass(context);
        this.data.target = this.computeTarget();
        this.result = new this.constructor.evaluatorClass(data);
        this.evaluateOpposedTests();
    }

    // Base test has no target computation, just use static value provided
    computeTarget() 
    {
        return this.data.target + this.data.modifier + (game.impmal.config.difficulties[this.data.difficulty]?.modifier || 0);
    }

    async roll() 
    {
        await this.result.evaluate(this.data);
        // Save roll
        mergeObject(this.data.result, this.result.getPersistentData());
        await this.postRoll();
        // await this.evaluateOpposedTests();
        await this.sendToChat();
        // this.context.handleOpposed();
        return this;
    }

    /**
     * Actions performed after the roll, used by subclasses
     * Example: Decreasing ammo
     */
    async postRoll()
    {

    }

    reroll(fate=false) 
    {
        if (fate)
        {
            if (this.context.fateReroll)
            {
                ui.notifications.error("IMPMAL.ErrorFateRerollUsed");
                throw game.i18n.localize("IMPMAL.ErrorFateRerollUsed");
            }

            if(this.actor.system.fate.value <= 0)
            {
                ui.notifications.error("IMPMAL.ErrorNoFateLeft");
                throw game.i18n.localize("IMPMAL.ErrorNoFateLeft");
            }

            this.actor.update({"system.fate.value" : this.actor.system.fate.value - 1});
            this.context.fateReroll = true;
        }

        delete this.data.result.roll;
        this.roll();
    }

    addSL(num=1, fate=false)
    {
        if (fate)
        {
            if (this.context.fateAddSL)
            {
                ui.notifications.error("IMPMAL.ErrorFateSLUsed");
                throw game.i18n.localize("IMPMAL.ErrorFateSLUsed");
            }

            if(this.actor.system.fate.value <= 0)
            {
                ui.notifications.error("IMPMAL.ErrorNoFateLeft");
                throw game.i18n.localize("IMPMAL.ErrorNoFateLeft");
            }

            this.actor.update({"system.fate.value" : this.actor.system.fate.value - 1});
            this.context.fateAddSL = true;
        }

        this.data.SL += num;
        delete this.data.result.signedSL; // Remove 
        this.roll();
    }

    modify(data)
    {
        mergeObject(this, data);
        this.roll();
    }

    async sendToChat({newMessage = false}={}) 
    {

        let chatData = await this._chatData();

        // If no message exists, or new message requested, create one
        if (!this.message || newMessage)
        {
            let msg = await ChatMessage.create(chatData);   

            // Cannot assign message until after message is created, so save again
            this.context.message = msg;
            this.save();
            return msg;
        }
        else // If existing message, update it
        {
            return this.message.update(chatData);
        }
    }

    evaluateOpposedTests()
    {
        this.opposedResults = [];
        for (let messageId of this.context.responses)
        {
            let test = game.messages.get(messageId)?.test;
            if (test)
            {
                this.opposedResults.push({target : test.actor, result : new OpposedTestResult(this.result, test.result)});
            }
        }
    }

    save() 
    {
        return this.message?.update({
            flags : this._saveData()
        });
    }

    _saveData()
    {
        return {
            impmal : {
                test : {
                    data : this.data,
                    context : this.context,
                    class : this.constructor.name
                }
            }
        };
    }

    async _chatData() 
    {
        if (this.itemDetailsTemplate)
        {
            this.itemDetails = await renderTemplate(this.itemDetailsTemplate, this);
        }
        if (this.testDetailsTemplate)
        {
            this.testDetails = await renderTemplate(this.testDetailsTemplate, this);
        }
        let chatData = ChatMessage.applyRollMode({}, this.context.rollmode);
        let content = await renderTemplate(this.rollTemplate, this);
        return mergeObject( chatData, {
            content,
            title : this.context.title,
            speaker : this.context.speaker,
            flavor: this.context.title,
            type : CONST.CHAT_MESSAGE_TYPES.ROLL,
            rolls : [this.result.rollObject instanceof Roll ? this.result.rollObject.toJSON() : this.result.rollObject], // Trigger DSN
            flags : this._saveData()
        });
    }

    get actor() 
    {
        return this.context.actor;
    }

    get item() 
    {
        return this.context.item;
    }

    get message() 
    {
        return this.context.message;
    }
    
    /**
     * Separates a flat object containing test data from a roll dialog into
     * roll data and context data and creates a Test object from it
     * 
     * @param {object} data Flat object with test data (usually from a dialog)
     * @returns Constructed roll class
     */
    static fromData(data) 
    {
        return new this({
            data : this._getDialogTestData(data),
            context : this.contextClass.fromData(data)
        });
    }


    /**
     * Extract test data from flat dialog data
     * 
     * @param {Object} data Data provided from the dialog
     */
    static _getDialogTestData(data)
    {
        return {
            modifier : data.modifier,
            difficulty : data.difficulty,
            SL : data.SL,       
            state : data.state,   
            reverse : data.reverse,
            target : data.target
        };
    }


    _defaultData() 
    {
        return {
            modifier : 0,                 // Added to target
            difficulty : "challenging",   // Added to target
            SL : 0,                       // Added to SL result
            state : "none",                   // Advantage/disadvantage
            reverse : false,              // Force reversal
            result : {}                   // Predefined result
        };
    }

    // Creates a test object with `message.test`
    static _addMessageTestGetter() 
    {
        Object.defineProperty(CONFIG.ChatMessage.documentClass.prototype, "test", {
            get : function test() 
            {
                let test = this.getFlag("impmal", "test");
                if (test)
                {
                    return new game.impmal.testClasses[test.class](test);
                }
                else 
                {
                    return undefined;
                }
            }
        });
    }
}