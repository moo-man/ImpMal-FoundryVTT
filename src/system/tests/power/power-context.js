import log from "../../logger";
import { SkillTestContext } from "../skill/skill-context";

export class PowerTestContext extends SkillTestContext
{
    powerId = this.powerId;

    static fromData(data) 
    {
        log(`${this.prototype.constructor.name} - Retrieving Context Data`, {args : data});
        let context = mergeObject(super.fromData(data), {powerId : data.powerId});
        log(`${this.prototype.constructor.name} - Context Data Retrieved`, {args : context});
        return context;
    }

    get power() 
    {
        return this.actor.items.get(this.powerId);
    }
}