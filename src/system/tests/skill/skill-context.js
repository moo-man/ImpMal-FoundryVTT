import log from "../../logger";
import { CharacteristicTestContext } from "../characteristic/characteristic-context";

export class SkillTestContext extends CharacteristicTestContext
{
    skill = this.skill;   
    skillItemId = this.skillItemId;

    static fromData(data) 
    {
        log(`${this.prototype.constructor.name} - Retrieving Context Data`, {args : data});
        let context = mergeObject(super.fromData(data), {
            skill : data.skill, 
            skillItemId : data.skillItemId
        });
        log(`${this.prototype.constructor.name} - Context Data Retrieved`, {args : context});
        return context;
    }

    get actorSkill()
    {
        return this.actor.items.get(this.skillItemId) || this.actor.system.skills[this.skill];
    }
}