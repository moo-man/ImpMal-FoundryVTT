import { SkillTest } from "../skill/skill-test";
import { TargetCalculator } from "../target-calculator";
import { WeaponTestContext } from "./weapon-context";
import { WeaponTestEvaluator } from "./weapon-evaluator";

export class WeaponTest extends SkillTest
{

    static contextClass = WeaponTestContext;
    static evaluatorClass = WeaponTestEvaluator;


    computeTarget() 
    {
        return TargetCalculator.compute({
            actor : this.actor, 
            type : "weapon", 
            data : this.context.weapon, 
            modifier : this.data.modifier, 
            difficulty : this.data.difficulty
        });
    }

    get item() 
    {
        return this.context.weapon;
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