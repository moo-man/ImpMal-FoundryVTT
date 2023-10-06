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
        await Promise.all(this.actor.runScripts("preRollSkillTest", this));
        await Promise.all(this.item?.runScripts?.("preRollSkillTest", this) || []);
    }

    async runPostScripts()
    {
        await super.runPostScripts();
        await Promise.all(this.actor.runScripts("rollSkillTest", this));
        await Promise.all(this.item?.runScripts?.("rollSkillTest", this) || []);
    }

    async postRoll()
    {
        await super.postRoll();

        this._computeWarp();
        this._computePurge();
        this._handleCorruption();
    }

    _handleCorruption()
    {
        if (this.context.corruption && this.actor.type == "character")
        {
            let corruption = Number.isNumeric(this.context.corruption) ? this.context.corruption : game.config.impmal.corruptionValues[this.context.corruption];

            // Tag shows source corruption value
            this.context.tags["corruption"] = game.i18n.format("IMPMAL.CorruptionNum", {corruption});

            // negative SL doesn't add to corruption, and if SL is higher than corruption it shouldn't go negative
            corruption -= Math.min(corruption, Math.max(this.result.SL, 0));

            // Text shows how much added after SL reduction
            this.context.text["corruptionAdded"] = game.i18n.format("IMPMAL.CorruptionAdded", {corruption});

            // Record the starting corruption in case this test is edited
            if (!hasProperty(this.context, "baseCorruption"))
            {
                this.context.baseCorruption = this.actor.system.corruption.value;
            }

            this.actor.update({"system.corruption.value" : this.context.baseCorruption + corruption});
        }
    }

    _computeWarp() 
    {
        if (this.context.warp) 
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
        if (this.context.purge && !this.context.purged) 
        {
            if (this.succeeded) 
            {
                this.context.purged = Math.min(this.actor.system.warp.charge, this.actor.system.characteristics.wil.bonus + this.result.SL); // If reroll, remove previous purge
                this.actor.update({ "system.warp.charge": this.actor.system.warp.charge - this.context.purged });
            }
        }
    }

    get tags() 
    {
        let tags = super.tags;

        if (this.context.warp)
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

        if (this.context.purge)
        {
            if(this.succeeded)
            {
                tags.push(`<strong>${game.i18n.localize("IMPMAL.Purged")}</strong>: ${this.context.purged}`);
                tags.push(`<strong>[[/r 1d100 + ${10 * this.context.purged}]]{${game.i18n.localize("IMPMAL.PsychicPhenomena")}}</strong>`);
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