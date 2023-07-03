import { EditTestForm } from "../../../apps/edit-test";
import { OpposedTestResult } from "../opposed-result";
import { BaseTestEvaluator } from "./base-evaluator";
import { TestContext } from "./test-context";

export class BaseTest 
{

    static contextClass = TestContext;
    static evaluatorClass = BaseTestEvaluator;
    rollTemplate = "systems/impmal/templates/chat/rolls/roll.hbs";
    testDetailsTemplate = "";
    itemSummaryTemplate = "systems/impmal/templates/item/partials/item-summary.hbs";

    constructor({data, context})
    {
        this.data = mergeObject(data, this._defaultData(), {overwrite : false, recursive : true});

        this.context = new this.constructor.contextClass(context);
        this.data.target = this.computeTarget();
        this.result = new this.constructor.evaluatorClass(data);
    }

    // Base test has no target computation, just use static value provided
    computeTarget() 
    {
        return this.data.target + this.data.modifier + (game.impmal.config.difficulties[this.data.difficulty]?.modifier || 0);
    }

    async roll() 
    {
        await this.evaluate();
        await this.postRoll();
        await this.sendToChat();

        return this;
    }

    // Evaluate test result
    // Optionally update message (useful for rerendering targets or attackers)
    async evaluate(render=false)
    {
        await this.result.evaluate(this.data);
        // Save roll
        mergeObject(this.data.result, this.result.getPersistentData());
        if (render)
        {
            this.sendToChat();
        }
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

    async applyDamageTo(targetId)
    {
        let opposed = this.opposedTests.find(t => t.id == targetId);

        let damageData = await opposed.actor.applyDamage(opposed.result.damage, {location: this.result.hitLocation, test : this});
        this.context.setApplied(targetId, damageData);
        this.roll();
    }

    /**
     * Create a chat card represeting this test
     * 
     * @param {Boolean} newMessage Forcibly create a new message 
     * @param {Boolean} updateOpposed Prevent updating opposing messages (needed to prevent infinite loops back and forth)
     * @returns 
     */
    async sendToChat({newMessage = false, updateOpposed=true}={}) 
    {

        let chatData = await this._chatData();

        // If no message exists, or new message requested, create one
        if (!this.message || newMessage)
        {
            let msg = await ChatMessage.create(chatData);   

            // Cannot assign message until after message is created, so save again
            this.context.message = msg;
            await this.save();
            return msg;
        }
        else // If existing message, update it
        {
            return this.message.update(chatData, {updateOpposed});
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
        if (this.item instanceof Item)
        {
            this.itemSummary = await renderTemplate(this.itemSummaryTemplate, mergeObject(this.item?.system?.summaryData(), {summaryLabel : this.item.name, hideNotes : true}));
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

    get tags() 
    {
        let tags = [];
        if (this.result.state == "adv")
        {
            tags.push(game.i18n.localize("IMPMAL.Advantage"));
        }
        if (this.result.state == "dis")
        {
            tags.push(game.i18n.localize("IMPMAL.Disadvantage"));
        }
        return tags;
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

    get succeeded() 
    {
        return this.result.outcome == "success";
    }

    get failed() 
    {
        return !this.succeeded;
    }


    // Attacker test details
    get defending() 
    {
        let attackMessage = this.context.findAttackingMessage();
        let attackingTest = attackMessage?.test;
        if (attackingTest)
        {

            let attackerId = attackingTest.context.speaker.token;
            let attackingActor = attackingTest.actor;

            // Flip attacker / defender to get results in the right perspective
            // e.g. If the attacker won by +2, the defender lost by -2
            let result = new OpposedTestResult(this, attackingTest); 
            
            return {
                test : attackingTest,
                id : attackerId,
                actor : attackingActor,
                result
            };
        }
        return null;
    }

    
    // Targets details
    get opposedTests()
    {
        let opposedTests = foundry.utils.deepClone(this.context.targets);
        for (let opposed of opposedTests)
        {
            if (opposed.test)
            {
                opposed.result = new OpposedTestResult(this, opposed.test);
            }
            else if (opposed.unopposed)
            {
                opposed.result = new OpposedTestResult(this);
            }
        }
        return opposedTests;
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
            state : "none",               // Advantage/disadvantage
            reverse : false,              // Force reversal
            computeDoubles : false,       // Note whether criticals/fumbles happened
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

    static _chatListeners(html)
    {
        html.on("click", ".apply-damage", async ev => 
        {
            let el = $(ev.currentTarget);
            let message = game.messages.get(el.parents(".message").attr("data-message-id"));
            let test = message.test;
            let targetId = el.parents(".target").attr("data-id");
            let apply = true;
            if (test.context.appliedDamage[targetId])
            {
                apply = await Dialog.confirm({
                    title : game.i18n.localize("IMPMAL.ReapplyDamageTitle"),
                    content : game.i18n.localize("IMPMAL.ReapplyDamagePrompt"),
                    yes : () => {return true;},
                    no : () => {return false;},
                    close : () => {return false;},
                });
            }
            if (apply)
            {
                test.applyDamageTo(targetId);
            }
        });

        html.on("click", ".roll", ev => 
        {
            let uuid = ev.currentTarget.dataset.uuid;
            let actors = [];
            if (game.user.character)
            {
                actors.push(game.user.character);
            }
            else 
            {
                actors = canvas.tokens.controlled.map(t => t.actor);
            }

            actors.forEach(a => 
            {
                a.setupTestFromItem(uuid);
            });
        });
    }

    static _addTestContextOptions(options)
    {
        let hasTest = li =>
        {
            let message = game.messages.get(li.attr("data-message-id"));
            return message.test;
        };

        let hasPendingOpposedTests = li => 
        {
            let message = game.messages.get(li.attr("data-message-id"));
            return hasTest(li) && message.test.context.targets.some(t => !t.test && !t.unopposed); // If no response test, and not unopposed = pending opposed test
        };

        let canEdit = li =>
        {
            return hasTest(li) && game.user.isGM;
        };

        options.unshift(
            {
                name: game.i18n.localize("IMPMAL.Unopposed"),
                icon: '<i class="fa-solid fa-arrow-right"></i>',
                condition: hasPendingOpposedTests,
                callback: li =>
                {
                    let message = game.messages.get(li.attr("data-message-id"));
                    let test = message.test;
                    test.context.fillUnopposed();
                    test.roll();
                }
            },
            {
                name: game.i18n.localize("IMPMAL.EditTest"),
                icon: '<i class="fa-solid fa-edit"></i>',
                condition: canEdit,
                callback: li =>
                {
                    let message = game.messages.get(li.attr("data-message-id"));
                    new EditTestForm(message.test).render(true);
                }
            },
            {
                name: game.i18n.localize("IMPMAL.RerollTest"),
                icon: '<i class="fa-solid fa-rotate-right"></i>',
                condition: hasTest,
                callback: li =>
                {
                    let message = game.messages.get(li.attr("data-message-id"));
                    message.test.reroll();
                }
            },
            {
                name: game.i18n.localize("IMPMAL.RerollTestFate"),
                icon: '<i class="fa-solid fa-rotate-right"></i>',
                condition: hasTest,
                callback: li =>
                {
                    let message = game.messages.get(li.attr("data-message-id"));
                    message.test.reroll(true);
                }
            },
            {
                name: game.i18n.localize("IMPMAL.AddSLFate"),
                icon: '<i class="fa-solid fa-plus"></i>',
                condition: hasTest,
                callback: li =>
                {
                    let message = game.messages.get(li.attr("data-message-id"));
                    message.test.addSL(1, true);
                }
            },
        );
    }
}