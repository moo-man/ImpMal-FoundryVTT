import { BaseTest } from "../base/base-test";
import { TargetCalculator } from "../target-calculator";
import { CharacteristicTestContext } from "./characteristic-context";

export class CharacteristicTest extends BaseTest
{

    static contextClass = CharacteristicTestContext;

    /**
     * Compute the target value for this test
     * 
     * @param {Boolean} base Whether to add modifiers/difficulty
     * @returns 
     */
    computeTarget(base=false) 
    {
        let targetData = {
            actor : this.actor, 
            type : "characteristic", 
            data : this.context.characteristic, 
        };

        if (!base)
        {
            targetData.modifier = this.data.modifier, 
            targetData.difficulty = this.data.difficulty;
        }

        return TargetCalculator.compute(targetData);
    }

    get characteristic() 
    {
        return this.actor.system.characteristics[this.context.characteristic];
    }

}