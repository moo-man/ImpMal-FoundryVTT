
import { CharacteristicTestContext } from "../characteristic/characteristic-context";

export class SkillTestContext extends CharacteristicTestContext
{
    // skill = this.skill;   
    // skillItemId = this.skillItemId;
    // corruption = this.corruption;

    static fromData(data) 
    {
        log(`${this.prototype.constructor.name} - Retrieving Context Data`, {args : data});
        let context = foundry.utils.mergeObject(super.fromData(data), {
            skill : data.skill, 
            skillItemId : data.skillItemId,
            maxPurged : data.maxPurged
        });
        log(`${this.prototype.constructor.name} - Context Data Retrieved`, {args : context});
        return context;
    }

    get actorSkill()
    {
        return this.actor.items.get(this.skillItemId) || this.actor.system.skills[this.skill];
    }
}