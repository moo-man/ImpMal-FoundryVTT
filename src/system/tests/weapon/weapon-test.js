import { SkillTest } from "../skill/skill-test";
import { TargetCalculator } from "../target-calculator";
import { WeaponTestContext } from "./weapon-context";

export class WeaponTest extends SkillTest
{

    static contextClass = WeaponTestContext;

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
}