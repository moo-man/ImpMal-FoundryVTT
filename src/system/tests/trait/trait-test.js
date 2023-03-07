import { SkillTest } from "../skill/skill-test";
import { TargetCalculator } from "../target-calculator";
import { TraitTestContext } from "./trait-context";

export class TraitTest extends SkillTest
{
    static contextClass = TraitTestContext;

    computeTarget() 
    {
        return TargetCalculator.compute({
            actor : this.actor, 
            type : "skill", 
            data : {skill : this.context.actorSkill, characteristic : this.context.characteristic}, 
            modifier : this.data.modifier, 
            difficulty : this.data.difficulty
        });
    }

    get item() 
    {
        return this.context.trait;
    }
}