import { AttackTest } from "../attack/attack-test";
import { TargetCalculator } from "../target-calculator";
import { WeaponTestContext } from "./weapon-context";

export class WeaponTest extends AttackTest
{
    static contextClass = WeaponTestContext;
    testDetailsTemplate = "systems/impmal/templates/chat/rolls/details/weapon-test.hbs";

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
            type : "weapon", 
            data : this.context.weapon, 
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
        await Promise.all(this.actor.runScripts("preRollWeaponTest", this));
        await Promise.all(this.item.runScripts("preRollWeaponTest", this));
    }

    async runPostScripts()
    {
        await super.runPostScripts();
        await Promise.all(this.actor.runScripts("rollWeaponTest", this));
        await Promise.all(this.item.runScripts("rollWeaponTest", this));
    }

    async roll() 
    {
        // If rolling with this flag, it indicates some sort of reroll, so clear filled responses for new ones
        if (this.context.failedRanged)
        {
            // Foundry syntax needed to replace existing object with blank object, instead of merging (TODO: likely needs replacing in V14)
            this.context["==responses"] = {};
            this.context["-=failedRanged"] = null;

            // Local updates
            this.context.responses = {};
            delete this.context.failedRanged;

            await this.save({skipOpposed: true}); // Since we are rolling after this, opposed will be handled (prevents two opposed messages)
            
            // Remove these flags so the roll update doesn't delete them again
            // (probably can be removed after converting to v14 method)
            delete this.context["==responses"] 
            delete this.context["-=failedRanged"] 
        }
        return await super.roll();
    }

    async postRoll()
    {
        await super.postRoll();
        
        try 
        {
            // Decrease ammo and mag count. 
            // NPCs might not actually have ammo items, so just decrease mag count for them
            let ammo = this.item.system.ammo.document;
            if (this.item.system.isRanged && !this.context.ammoUsed)
            {
                let ammoUsed = this.computeAmmoUsed() + this.context.additionalAmmoUsed;

                this.item.update(this.item.system.useAmmo(ammoUsed));
                ammo?.update(ammo.system.decrease(ammoUsed));
                this.context.ammoUsed = true;
            }
        }
        catch(e)
        {
            ui.notifications.error(`${game.i18n.localize("IMPMAL.ErrorAmmoUse")}: ${e}`);
        }

        // If this test is with a ranged weapon and fails, no defender test is needed
        if (this.item.system.isRanged && this.failed)
        {
            await this.context.fillUnopposed();
            this.context.failedRanged = true;
            this.result.text["failedRanged"] = game.i18n.localize("IMPMAL.FailedRanged");
        }
        else 
        {
            this.context.failedRanged = false;
        }
    }


    computeAmmoUsed()
    {
        let superchargeMultiplier = this.result.supercharge ? 2 : 1;

        let rapidFireUsed = (this.result.fireMode == "rapidFireAdv" || this.result.fireMode == "rapidFireSpread");

        if (game.settings.get("impmal", "countEveryBullet"))
        {
            let multiplier = game.settings.get("impmal", "countEveryBullet") ? 5 : 1;
            if (this.result.fireMode == "burst")
            {
                return superchargeMultiplier * multiplier;
            }
            else if (rapidFireUsed)
            {
                return superchargeMultiplier * this.itemTraits.has("rapidFire").value * multiplier;
            }
            else 
            {
                return superchargeMultiplier * 1;
            }
        }
        else // RAW
        {
            let baseAmmoUsed; // RapidFire and Burst weapons don't consume ammo unless those traits are used
            if (this.itemTraits.has("rapidFire") || this.itemTraits.has("burst"))
            {
                baseAmmoUsed =  0;
            }
            else 
            {
                baseAmmoUsed = 1;
            }
            return superchargeMultiplier * (baseAmmoUsed + (this.result.fireMode == "burst" ? 1 : 0) + (rapidFireUsed ? Number(this.itemTraits.has("rapidFire").value) : 0));
        }
    }

    get item() 
    {
        return this.context.weapon;
    }

}