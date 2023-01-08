import { CharacteristicTest } from "../characteristic/characteristic-test";
import { TargetCalculator } from "../target-calculator";
import { SkillTestContext } from "./skill-context";

export class SkillTest extends CharacteristicTest
{

    static contextClass = SkillTestContext;

    computeTarget() 
    {
        return TargetCalculator.compute({
            actor : this.actor, 
            type : "skill", 
            data : {skill : this.item || this.skill, characteristic : this.context.characteristic}, 
            modifier : this.data.modifier, 
            difficulty : this.data.difficulty
        });
    }

    get item() 
    {
        // Only return if SkillSpec item is used
        return this.context.actorSkill instanceof Item ? this.context.actorSkill : undefined;
    }

    get skill() 
    {
        return this.context.skill;
    }
}