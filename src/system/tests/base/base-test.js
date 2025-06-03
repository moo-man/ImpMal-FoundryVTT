import { OpposedTestResult } from "../opposed-result";
import { BaseTestEvaluator } from "./base-evaluator";
import { TestContext } from "./test-context";

export class BaseTest extends WarhammerTestBase
{

    static contextClass = TestContext;
    static evaluatorClass = BaseTestEvaluator;
    rollTemplate = "systems/impmal/templates/chat/rolls/roll.hbs";
    testDetailsTemplate = "";
    itemSummaryTemplate = "systems/impmal/templates/item/partials/item-summary.hbs";

    constructor({data, context, result=null})
    {
        super();

        this.data = foundry.utils.mergeObject(data, this._defaultData(), {overwrite : false, recursive : true});
        this.context = new this.constructor.contextClass(context);
        if (this.context.breakdownData)
        {
            this.context.breakdown = this._formatBreakdown(this.context.breakdownData);
        }
        this.data.target = this.computeTarget();
        if (!result)
        {
            this.result = new this.constructor.evaluatorClass(data);
        }
        else 
        {
            this.result = this.constructor.evaluatorClass.fromData(result);
        }
    }

    /**
     * Compute the target value for this test
     * Base test has no target computation, just use static value provided
     * 
     * @param {Boolean} base Whether to add modifiers/difficulty
     * @returns 
     */
    computeTarget(base=false) 
    {
        if (base)
        {
            return this.data.target;
        }
        else
        {
            return this.data.target + this.data.modifier + (game.impmal.config.difficulties[this.data.difficulty]?.modifier || 0);
        }
    }

    async roll() 
    {
        await this.runPreScripts();
        await this.evaluate();
        await this.runPostScripts();
        await this.postRoll();
        await this.sendToChat();

        return this;
    }

    async runPreScripts()
    {
        await Promise.all(this.actor.runScripts("preRollTest", this));
        await Promise.all(this.context.item?.runScripts("preRollTest", this) || [])
    }

    async runPostScripts()
    {
        await Promise.all(this.actor.runScripts("rollTest", this));
        await Promise.all(this.context.item?.runScripts("rollTest", this) || [])
    }

    // Evaluate test result
    // Optionally update message (useful for rerendering targets or attackers)
    async evaluate(render=false)
    {
        await this.result.evaluate(this.data, this.context.rollMode);
        // Save roll
        foundry.utils.mergeObject(this.data.result, this.result.getPersistentData());
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
        this.result.computeTagsAndText();
    }

    reroll(fate=false) 
    {
        if (fate)
        {
            if (this.context.fateReroll)
            {
                ui.notifications.error("IMPMAL.ErrorFateRerollUsed", {localize : true});
                throw game.i18n.localize("IMPMAL.ErrorFateRerollUsed");
            }

            if(this.actor.system.fate.value <= 0)
            {
                ui.notifications.error("IMPMAL.ErrorNoFateLeft", {localize : true});
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
                ui.notifications.error("IMPMAL.ErrorFateSLUsed", {localize : true});
                throw game.i18n.localize("IMPMAL.ErrorFateSLUsed");
            }

            if(this.actor.system.fate.value <= 0)
            {
                ui.notifications.error("IMPMAL.ErrorNoFateLeft", {localize : true});
                throw game.i18n.localize("IMPMAL.ErrorNoFateLeft");
            }

            this.actor.update({"system.fate.value" : this.actor.system.fate.value - 1});
            this.context.fateAddSL = true;
        }

        this.data.SL += num;
        this.roll();
    }

    modify(data)
    {
        foundry.utils.mergeObject(this, data);
        this.roll();
    }

    async applyDamageTo(targetId)
    {
        let opposed = this.opposedTests.find(t => t.id == targetId);

        opposed.actor.applyDamage(opposed.result.damage, {ignoreAP : this.item?.system?.damage?.ignoreAP, location: this.result.hitLocation, opposed}).then(data => 
        {
            if (data.woundsGained > 0 && this.damageEffects.length)
            {
                opposed.actor.applyEffect({effectUuids : this.damageEffects.map(i => i.uuid), messageId : this.message.id});
            }
            this.context.setApplied(targetId, data);
            this.roll();
        });
    }

    /**
     * Create a chat card represeting this test
     * 
     * @param {Boolean} newMessage Forcibly create a new message
     * @returns 
     */
    async sendToChat({newMessage = false}={})
    {

        let chatData = await this._chatData();

        // If no message exists, or new message requested, create one
        if (!this.message || newMessage)
        {

            let id = randomID();
            chatData._id = id;
            chatData.system.context.messageId = id;
            let msg = await ChatMessage.create(chatData, {keepId : true});
            // Cannot assign message until after message is created, so save again
            // await this.save();
            return msg;
        }
        else // If existing message, update it
        {
            return this.message.update(chatData);
        }
    }

    save() 
    {
        return this.message?.update({system : this._saveData()});
    }

    _saveData()
    {
        return {
            data : this.data,
            context : {...this.context},
            result : {...this.result},
            class : this.constructor.name
        };
    }

    async _chatData() 
    {
        if (this.item)
        {
            this.itemSummary = await this.context.formatItemSummary()
        }
        this.effectButtons = await renderTemplate("modules/warhammer-lib/templates/partials/effect-buttons.hbs", {targetEffects : this.targetEffects, zoneEffects : this.zoneEffects});

        if (this.testDetailsTemplate)
        {
            this.testDetails = await renderTemplate(this.testDetailsTemplate, this);
        }
        let chatData = ChatMessage.applyRollMode({}, this.context.rollMode);
        let content = await renderTemplate(this.rollTemplate, this);
        return foundry.utils.mergeObject( chatData, {
            content,
            speaker : this.context.speaker,
            type : "test",     
            rollMode : this.context.rollMode,                                         // Trigger DSN
            rolls : this.result.rollObject ? ([this.result.rollObject instanceof Roll ? this.result.rollObject.toJSON() : this.result.rollObject]) : [], 
            system : this._saveData()
        });
    }

    get showChatTest() {
        let effects = this.targetEffects.concat(this.damageEffects).concat(this.zoneEffects)
    
        // Effects already prompt a test
        if (effects.some(e => e.system.transferData.avoidTest.value == "item"))
        {
          return false;
        }
        else
        {
          return this.succeeded && this.context.itemTest.isValid
        }
      }
    

    get tags() 
    {
        // Tags from context are saved, tags from results are computed
        let tags = Object.values(foundry.utils.mergeObject(foundry.utils.deepClone(this.context.tags), this.result.tags));
        if (this.context.superiorityUsed)
        {
            tags.push(game.i18n.localize("IMPMAL.Superiority"));
        }
        return tags;
    }

    get text() 
    {
        // Tags from context are saved, tags from results are computed
        let text = Object.values(foundry.utils.mergeObject(foundry.utils.deepClone(this.context.text), this.result.text));
        return text;
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

    get targetTokens()
    {
        return this.context.targetSpeakers.map(i => game.scenes.get(i.scene)?.tokens.get(i.token));
    }

    // get targetEffects() 
    // {
    //     return super.targetEffects.concat(this.context.item?.targetEffects || []);
    // }

    // get damageEffects() 
    // {
    //     return super.damageEffects.concat(this.context.item?.damageEffects || []);
    // }

    // get zoneEffects() 
    // {
    //     return super.zoneEffects.concat(this.context.item?.zoneEffects || []);
    // }

    // get areaEffects() 
    // {
    //     return super.areaEffects.concat(this.context.item?.areaEffects || []);
    // }


    // Attacker test details
    get defending() 
    {
        let attackMessage = this.context.findAttackingMessage();
        let attackingTest = attackMessage?.system.test;
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
            opposed.attackerTest = this;
            opposed.defenderTest = opposed.test;
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
            onlyAutomaticSuccess : data.onlyAutomaticSuccess,
            target : data.target,
        };
    }

    
    _formatBreakdown(breakdown)
    {
        breakdown.base = breakdown.base.replace("@BASE", this.computeTarget(true));
        breakdown.modifiersBreakdown = `<hr><p>${game.i18n.localize("IMPMAL.ModifierBreakdown")}</p>${breakdown.modifiersBreakdown}`;
        return Object.values(breakdown).join("");
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
            onlyAutomaticSuccess : false,
            result : {}                   // Predefined result
        };
    }
}