
import { TestContext } from "../base/test-context";

export class AvailabilityContext extends TestContext
{    
    static fromData(data) 
    {
        log(`${this.prototype.constructor.name} - Retrieving Context Data`, {args : data});
        let context = mergeObject(super.fromData(data), {uuid : data.item?.uuid, targetSpeakers : []});
        log(`${this.prototype.constructor.name} - Context Data Retrieved`, {args : context});
        return context;
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