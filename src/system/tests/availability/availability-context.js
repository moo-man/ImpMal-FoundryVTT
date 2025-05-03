
import { TestContext } from "../base/test-context";

export class AvailabilityContext extends TestContext
{    
    static fromData(data) 
    {
        log(`${this.prototype.constructor.name} - Retrieving Context Data`, {args : data});
        let context = foundry.utils.mergeObject(super.fromData(data), {uuid : data.item?.uuid, itemData : data.item?.toObject(), targetSpeakers : []});
        context.itemData.system.cost = data.cost || context.itemData.system.cost;
        log(`${this.prototype.constructor.name} - Context Data Retrieved`, {args : context});
        return context;
    }
    
    get item() 
    {
        return new Item.implementation(this.itemData);
    }

    // None of these are needed for availability tests
    findAttackingMessage() 
    {}

    findOpposedMessage() 
    {}
  
    findDefendingMessage()
    {}
  
    addOpposedResponse()
    {}
  
    addUnopposedResponse()
    {}
  
    fillUnopposed()
    {}
  
}