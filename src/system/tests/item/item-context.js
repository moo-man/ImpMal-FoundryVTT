
import { TestContext } from "../base/test-context";

export class ItemUseContext extends TestContext
{
    // itemId = this.itemId || "";

    static fromData(data) 
    {
        log(`${this.prototype.constructor.name} - Retrieving Context Data`, {args : data});
        let context = foundry.utils.mergeObject(super.fromData(data), {itemUsed : data.itemUsed, tags : {}, text : {}});
        log(`${this.prototype.constructor.name} - Context Data Retrieved`, {args : context});
        return context;
    }
 

    async handleOpposed()
    {
        // Do nothing
    }

}