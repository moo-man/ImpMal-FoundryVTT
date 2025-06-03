
import { SkillTestContext } from "../skill/skill-context";

export class WeaponTestContext extends SkillTestContext
{
    // weaponId = this.weaponId;
    // ammoUsed = this.ammoUsed || false;
    // vehicleId = this.vehicleId;
    additionalAmmoUsed = this.additionalAmmoUsed || 0;

    static fromData(data) 
    {
        log(`${this.prototype.constructor.name} - Retrieving Context Data`, {args : data});
        let context = foundry.utils.mergeObject(super.fromData(data), {weaponId : data.weapon.id, vehicleId : data.vehicle?.id });
        log(`${this.prototype.constructor.name} - Context Data Retrieved`, {args : context});
        return context;
    }

    get weapon() 
    {
        if (this.vehicleId)
        {
            let weapon =  game.actors.get(this.vehicleId).items.get(this.weaponId);
            weapon.system.computeOwned(this.actor); // If it's a vehicle weapon, this actor doesn't own it, so prepare it as if they did so the values are correct
            return weapon;
        }
        return this.actor.items.get(this.weaponId);
    }

    get item()
    {
        return this.weapon;
    }
}