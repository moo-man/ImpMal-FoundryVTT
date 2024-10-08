
import { TestContext } from "../base/test-context";

export class ItemUseContext extends TestContext
{
    // itemId = this.itemId || "";

    static fromData(data) 
    {
        log(`${this.prototype.constructor.name} - Retrieving Context Data`, {args : data});
        let context = mergeObject(super.fromData(data), {itemId : data.item.id, tags : {}, text : {}});
        log(`${this.prototype.constructor.name} - Context Data Retrieved`, {args : context});
        return context;
    }

    get item() 
    {
        let item = super.item;

        if (!item)
        {
            item = this.actor.items.get(this.itemId);
        }
        return item;
    }
 
}