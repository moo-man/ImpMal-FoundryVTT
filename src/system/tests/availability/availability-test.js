import { AvailabilityEvaluator } from "./availability-evaluator";
import { AvailabilityContext } from "./availability-context";
import { BaseTest } from "../base/base-test";

export class AvailabilityTest extends BaseTest
{

    static contextClass = AvailabilityContext;
    static evaluatorClass = AvailabilityEvaluator;
    static chatType = CONST.CHAT_MESSAGE_TYPES.ROLL;
    rollTemplate = "systems/impmal/templates/chat/rolls/availability.hbs";
    testDetailsTemplate = "";
    itemSummaryTemplate = "systems/impmal/templates/item/partials/item-summary.hbs";

    // Base test has no target computation, just use static value provided
    computeTarget() 
    {
        try 
        {
            return this.data.target ||  (game.impmal.config.worldAvailability[this.data.world][this.data.availability] + this.data.modifier);
        }
        catch(e)
        {
            throw Error("Error calculating availability target: " + e);
        }
    }


    async runPreScripts()
    {
        await Promise.all(this.actor?.runScripts("preRollTest", this) || []);
    }

    async runPostScripts()
    {
        await Promise.all(this.actor?.runScripts("rollTest", this) || []);
    }


    get tags() 
    {
        let tags = Object.values(this.context.tags);
        tags.push(game.i18n.format("IMPMAL.WorldType", {world : game.impmal.config.worlds[this.data.world]}));
        tags.push(game.impmal.config.availability[this.data.availability]);
        return tags;
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
        let testData = super._getDialogTestData(data);
        testData.world = data.world;
        testData.availability = data.availability;
        return testData;
    }
}