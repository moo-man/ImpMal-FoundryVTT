
import { SkillTestContext } from "../skill/skill-context";

export class PowerTestContext extends SkillTestContext
{
    // powerId = this.powerId;
    // push = this.push;
    additionalWarp = this.additionalWarp || 0;
    warpAdded = this.warpAdded || 0;
    // pushRoll = this.pushRoll; // Undefined if not applied, if number, it's been applied

    static fromData(data) 
    {
        log(`${this.prototype.constructor.name} - Retrieving Context Data`, {args : data});
        let context = mergeObject(super.fromData(data), {powerId : data.powerId, push : data.push});
        log(`${this.prototype.constructor.name} - Context Data Retrieved`, {args : context});
        return context;
    }

    get power() 
    {
        return this.actor.items.get(this.powerId);
    }

    
    get item() 
    {
        return this.power;
    }

    get targets() 
    {
        let targets = super.targets;

        // Default power targets to unopposed
        targets.forEach(t => 
        {
            if (!this.responses[t.id])
            {
                t.unopposed = true;
            }
        });
        return targets;
    }
}

