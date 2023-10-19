import { SkillTest } from "../skill/skill-test";
import { TargetCalculator } from "../target-calculator";
import { PowerTestContext } from "./power-context";

export class PowerTest extends SkillTest
{
    static contextClass = PowerTestContext;
    testDetailsTemplate = "systems/impmal/templates/chat/rolls/details/power-test.hbs";

    constructor({data, context, result})
    {
        data.computeDoubles = true;
        super({data, context, result});
    }


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

    async runPreScripts()
    {
        await super.runPreScripts();
        await Promise.all(this.actor.runScripts("preRollPowerTest", this));
        await Promise.all(this.item.runScripts("preRollPowerTest", this));
    }

    async runPostScripts()
    {
        await super.runPostScripts();
        await Promise.all(this.actor.runScripts("rollPowerTest", this));
        await Promise.all(this.item.runScripts("rollPowerTest", this));
    }


    async postRoll() 
    {
        await super.postRoll();

        if (this.actor.type == "character" || this.actor.type == "npc")
        {
            let charge = this.actor.system.warp.charge;
            let added = this.context.warpAdded;
            let rating = this.item.system.rating + this.context.additionalWarp;

            // Reduce Warp Rating by WPB if critical
            if (this.result.critical)
            {
                rating = Math.max(1, rating - this.actor.system.characteristics.wil.bonus);
            }

            // If postRoll() is re-evaluated, subtract the previous warpAdded 
            charge -= added;
            added = 0;
            if (this.result.outcome == "success")
            {
                added += rating;
            }
            else if (this.result.outcome == "failure")
            {
                added += Math.min(Math.abs(this.result.SL), rating);
            }

            // Double warp charge added if fumble
            if (this.result.fumble)
            {
                added *= 2;
            }

            charge += added;
            this.context.warpAdded = added;

            if (this.context.push && !this.context.pushRoll)
            {
                this.context.pushRoll = Math.ceil(CONFIG.Dice.randomUniform() * 10);
                charge += this.context.pushRoll;
            }

            this.actor.update({"system.warp.charge" : charge});
        }
    }

    get item() 
    {
        return this.context.power;
    }

    get tags() 
    {
        let tags = super.tags;

        // If over warp threshold, all powers are overt
        if (this.item.system.overt || this.actor.system.warp.state >= 1)
        {
            tags.push(game.i18n.localize("IMPMAL.Overt"));
        }

        // Show warp charge gained from pushing
        if (this.context.pushRoll)
        {
            tags.push(`${game.i18n.localize("IMPMAL.Push")}: ${this.context.pushRoll}`);
        }

        if (this.result.critical)
        {
            tags.push(`<span class="critical" data-tooltip='${game.i18n.localize("IMPMAL.PowerCriticalTooltip")}'>${game.i18n.localize("IMPMAL.Critical")}</span>`);
        }

        if (this.result.fumble)
        {
            tags.push(`<span class="fumble" data-tooltip='${game.i18n.localize("IMPMAL.PowerFumbleTooltip")}'>${game.i18n.localize("IMPMAL.Fumble")}</span>`);
        }

        // fumble while pushing - perils roll
        if (this.context.push && this.result.fumble)
        {
            tags.push(`<span class="fumble">[[/r 1d100]]{${game.i18n.localize("IMPMAL.PerilsOfTheWarp")}}</span>`);
        }
        return tags;
    }
}