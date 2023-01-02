import log from "../../logger";
import { SkillTestContext } from "../skill/skill-context";

export class WeaponTestContext extends SkillTestContext
{
    weaponId = this.weaponId;

    static fromData(data) 
    {
        log(`${this.prototype.constructor.name} - Retrieving Context Data`, {args : data});
        let context = mergeObject(super.fromData(data), {skill : data.skill, weaponId : data.weaponId});
        log(`${this.prototype.constructor.name} - Context Data Retrieved`, {args : context});
        return context;
    }

    get weapon() 
    {
        return this.actor.items.get(this.weaponId);
    }
}