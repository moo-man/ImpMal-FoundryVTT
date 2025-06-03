
import { SkillTestContext } from "../skill/skill-context";

export class TraitTestContext extends SkillTestContext
{
    itemId = this.itemId;

    static fromData(data) 
    {
        log(`${this.prototype.constructor.name} - Retrieving Context Data`, {args : data});
        let context = foundry.utils.mergeObject(super.fromData(data), {itemId : data.itemId});
        log(`${this.prototype.constructor.name} - Context Data Retrieved`, {args : context});
        return context;
    }

    get trait() 
    {
        return this.actor.items.get(this.itemId);
    }

    get item()
    {
        return this.trait;
    }
}