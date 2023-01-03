import { SkillTest } from "../skill/skill-test";
import { TargetCalculator } from "../target-calculator";
import { PowerTestContext } from "./power-context";

export class PowerTest extends SkillTest
{
    static contextClass = PowerTestContext;

    computeTarget() 
    {
        return TargetCalculator.compute({
            actor : this.actor, 
            type : "power", 
            data : this.context.power, 
            modifier : this.data.modifier, 
            difficulty : this.data.difficulty
        });
    }

    get item() 
    {
        return this.context.power;
    }
}