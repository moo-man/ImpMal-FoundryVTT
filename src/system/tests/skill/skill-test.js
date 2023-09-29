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

    async runPreScripts()
    {
        await super.runPreScripts();
        await this.actor.runScripts("preRollSkillTest", this);
        await this.item?.runScripts?.("preRollSkillTest", this);
    }

    async runPostScripts()
    {
        await super.runPostScripts();
        await this.actor.runScripts("rollSkillTest", this);
        await this.item?.runScripts?.("rollSkillTest", this);
    }

    async postRoll()
    {
        await super.postRoll();

        this._computeWarp();
        this._computePurge();
    }

    _computeWarp() 
    {
        if (this.context.other.warp) 
        {
            if (this.succeeded) 
            {
                this.actor.update({ "system.warp.state": 1 });
            }
            else 
            {
                this.actor.update({ "system.warp.state": 2 });
            }
        }

    }

    _computePurge() 
    {
        // Prevent rerolls from changing it
        // TODO: Click to activate so rerolls don't cause confusion?
        if (this.context.other.purge && !this.context.other.purged) 
        {
            if (this.succeeded) 
            {
                this.context.other.purged = Math.min(this.actor.system.warp.charge, this.actor.system.characteristics.wil.bonus + this.result.SL); // If reroll, remove previous purge
                this.actor.update({ "system.warp.charge": this.actor.system.warp.charge - this.context.other.purged });
            }
        }
    }

    get tags() 
    {
        let tags = super.tags;

        if (this.context.other.warp)
        {
            if (this.succeeded)
            {
                tags.push(game.i18n.localize("IMPMAL.WarpContained"));
            }
            else 
            {
                tags.push(game.i18n.localize("IMPMAL.WarpOutOfControl"));
            }
        }

        if (this.context.other.purge)
        {
            if(this.succeeded)
            {
                tags.push(`<strong>${game.i18n.localize("IMPMAL.Purged")}</strong>: ${this.context.other.purged}`);
                tags.push(`<strong>[[/r 1d100 + ${10 * this.context.other.purged}]]{${game.i18n.localize("IMPMAL.PsychicPhenomena")}}</strong>`);
            }
        }

        return tags;
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