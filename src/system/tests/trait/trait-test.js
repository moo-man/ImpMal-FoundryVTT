import { AttackTest } from "../attack/attack-test";
import { TargetCalculator } from "../target-calculator";
import { TraitTestContext } from "./trait-context";

export class TraitTest extends AttackTest
{
    static contextClass = TraitTestContext;

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
            type : "skill", 
            data : {skill : this.context.actorSkill, characteristic : this.context.characteristic}, 
        };
     
        if (!base)
        {
            targetData.modifier = this.data.modifier, 
            targetData.difficulty = this.data.difficulty;
        }
     
        return TargetCalculator.compute(targetData);
    }

    async runPreScripts()
    {
        await super.runPreScripts();
        await Promise.all(this.actor.runScripts("preRollTraitTest", this));
        await Promise.all(this.item.runScripts("preRollTraitTest", this));
    }

    async runPostScripts()
    {
        await super.runPostScripts();
        await Promise.all(this.actor.runScripts("rollTraitTest", this));
        await Promise.all(this.item.runScripts("rollTraitTest", this));
    }

    get item() 
    {
        return this.context.trait;
    }
}