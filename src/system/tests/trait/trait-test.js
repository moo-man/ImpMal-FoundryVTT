import { AttackTest } from "../attack/attack-test";
import { TargetCalculator } from "../target-calculator";
import { TraitTestContext } from "./trait-context";

export class TraitTest extends AttackTest
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

    async runPreScripts()
    {
        await super.runPreScripts();
        await this.actor.runScripts("preRollTraitTest", this);
        await this.item.runScripts("preRollTraitTest", this);
    }

    async runPostScripts()
    {
        await super.runPostScripts();
        await this.actor.runScripts("rollTraitTest", this);
        await this.item.runScripts("rollTraitTest", this);
    }

    get item() 
    {
        return this.context.trait;
    }
}