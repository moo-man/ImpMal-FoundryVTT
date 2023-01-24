import { SkillTest } from "../skill/skill-test";
import { TargetCalculator } from "../target-calculator";
import { PowerTestContext } from "./power-context";

export class PowerTest extends SkillTest
{
    static contextClass = PowerTestContext;
    testDetailsTemplate = "systems/impmal/templates/chat/rolls/details/power-test.hbs";

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

    async postRoll() 
    {
        await super.postRoll();

        if (this.actor.type == "character")
        {
            let charge = this.actor.system.warp.charge;
            let added = this.context.warpAdded;

            // If postRoll() is re-evaluated, subtract the previous warpAdded 
            charge -= added;
            added = 0;
            if (this.result.outcome == "success")
            {
                added += this.item.system.rating;
            }
            else if (this.result.outcome == "failure")
            {
                added += Math.min(Math.abs(this.result.SL), this.item.system.rating);
            }

            charge += added;
            this.context.warpAdded = added;

            if (this.context.push && !this.context.pushRoll)
            {
                this.context.pushRoll = Math.ceil(CONFIG.randomUniform * 10);
                charge += this.context.pushRoll;
            }

            this.actor.update({"system.warp.charge" : charge});
        }
    }

    get item() 
    {
        return this.context.power;
    }
}