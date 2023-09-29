import { AttackTest } from "../attack/attack-test";
import { TargetCalculator } from "../target-calculator";
import { WeaponTestContext } from "./weapon-context";

export class WeaponTest extends AttackTest
{
    static contextClass = WeaponTestContext;
    testDetailsTemplate = "systems/impmal/templates/chat/rolls/details/weapon-test.hbs";

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

    async runPreScripts()
    {
        await super.runPreScripts();
        await this.actor.runScripts("preRollWeaponTest", this);
        await this.item.runScripts("preRollWeaponTest", this);
    }

    async runPostScripts()
    {
        await super.runPostScripts();
        await this.actor.runScripts("rollWeaponTest", this);
        await this.item.runScripts("rollWeaponTest", this);
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
    }


    computeAmmoUsed()
    {

        if (game.settings.get("impmal", "countEveryBullet"))
        {
            let multiplier = game.settings.get("impmal", "countEveryBullet") ? 5 : 1;

            if (this.result.burst)
            {
                return multiplier;
            }
            else if (this.result.rapidFire)
            {
                return this.itemTraits.has("rapidFire").value * multiplier;
            }
            else 
            {
                return 1;
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

            return baseAmmoUsed + (this.result.burst ? 1 : 0) + (this.result.rapidFire ? Number(this.itemTraits.has("rapidFire").value) : 0);
        }
    }

    get item() 
    {
        return this.context.weapon;
    }

}