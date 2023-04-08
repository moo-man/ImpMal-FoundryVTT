import { SkillTest } from "../skill/skill-test";
import { AttackEvaluator } from "./attack-evaluator";


/**
 * Used by both Weapons and Traits to perform attacks
 */
export class AttackTest extends SkillTest
{

    static evaluatorClass = AttackEvaluator;
    testDetailsTemplate = "systems/impmal/templates/chat/rolls/details/attack-test.hbs";

    constructor({data, context})
    {
        data.computeDoubles = true;
        super({data, context});
    }

    get tags() 
    {
        let tags = super.tags;
        if (this.result.calledShot)
        {
            tags.push(`${game.i18n.localize("IMPMAL.CalledShot")}: <strong>${game.impmal.config.hitLocations[this.result.hitLocation]}</strong>`);
        }
        if (this.result.critical)
        {
            tags.push(`<span class="critical">[[/r 1d10]]{${game.i18n.localize("IMPMAL.Critical")}}</span>`);
        }
        if (this.result.fumble)
        {
            tags.push(`<span class="fumble">[[/r 1d10]]{${game.i18n.localize("IMPMAL.Fumble")}}</span>`);
        }
        return tags;
    }



    static _getDialogTestData(data)
    {
        let testData = super._getDialogTestData(data);
        testData.hitLocation = data.hitLocation;
        return testData;
    }


    _defaultData() 
    {
        let data = super._defaultData();
        data.hitLocation = "roll";
        return data;
    }
}