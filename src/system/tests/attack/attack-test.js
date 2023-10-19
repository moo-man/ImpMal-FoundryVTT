import { SkillTest } from "../skill/skill-test";
import { AttackEvaluator } from "./attack-evaluator";


/**
 * Used by both Weapons and Traits to perform attacks
 */
export class AttackTest extends SkillTest
{

    static evaluatorClass = AttackEvaluator;
    testDetailsTemplate = "systems/impmal/templates/chat/rolls/details/attack-test.hbs";

    constructor({data, context, result})
    {
        data.computeDoubles = true;
        super({data, context, result});
    }

    get tags() 
    {
        let tags = super.tags;
        if (this.result.fumble)
        {
            tags.push(`<span class="fumble">[[/r 1d10]]{${game.i18n.localize("IMPMAL.Fumble")}}</span>`);
            if (this.itemTraits.has("reliable"))
            {
                tags.push(`<span>[[/r 1d10]]{${game.i18n.localize("IMPMAL.Reliable")}}</span>`);
            }
        }
        if (this.result.supercharge)
        {
            tags.push(`${game.i18n.localize("IMPMAL.Supercharge")} (+${this.itemTraits.has("supercharge").value})`);
        }
        return tags;
    }

    get itemTraits() 
    {
        return this.item.system.traits || this.item.system.attack?.traits;
    }



    static _getDialogTestData(data)
    {
        let testData = super._getDialogTestData(data);
        testData.hitLocation = data.hitLocation;
        testData.supercharge = data.supercharge;
        testData.burst = data.burst;
        testData.rapidFire = data.rapidFire;
        return testData;
    }


    _defaultData() 
    {
        let data = super._defaultData();
        data.hitLocation = "roll";
        data.critModifier = 0;
        return data;
    }
}