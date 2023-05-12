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

    async postRoll()
    {
        await super.postRoll();
        
        try 
        {
            let ammo = this.item.system.ammo.document;
            if (this.item.system.attackType == "ranged" && ammo && !this.context.ammoUsed)
            {
                let baseAmmoUsed; // RapidFire and Burst weapons don't consume ammo unless those traits are used
                if (this.itemTraits.has("rapidFire") || this.itemTraits.has("burst"))
                {
                    baseAmmoUsed = 0;
                }
                else 
                {
                    baseAmmoUsed = 1;
                }

                let totalAmmoUsed = baseAmmoUsed + (this.result.burst ? 1 : 0) + (this.result.rapidFire ? Number(this.itemTraits.has("rapidFire").value) : 0);

                this.item.update(this.item.system.useAmmo(totalAmmoUsed));
                ammo.update(ammo.system.decrease(totalAmmoUsed));
                this.context.ammoUsed = true;
            }
        }
        catch(e)
        {
            ui.notifications.error(`${game.i18n.localize("IMPMAL.ErrorAmmoUse")}: ${e}`);
        }
    }

    get item() 
    {
        return this.context.weapon;
    }

}