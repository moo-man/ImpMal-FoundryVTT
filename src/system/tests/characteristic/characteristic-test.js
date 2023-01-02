import { BaseTest } from "../base/base-test";
import { TargetCalculator } from "../target-calculator";
import { CharacteristicTestContext } from "./characteristic-context";

export class CharacteristicTest extends BaseTest
{

    static contextClass = CharacteristicTestContext;

    computeTarget() 
    {
        return TargetCalculator.compute({
            actor : this.actor, 
            type : "characteristic", 
            data : this.context.characteristic, 
            modifier : this.data.modifier, 
            difficulty : this.data.difficulty
        });
    }

    get characteristic() 
    {
        return this.actor.system.characteristics[this.context.characteristic];
    }

}