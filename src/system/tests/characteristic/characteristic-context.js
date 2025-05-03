
import { TestContext } from "../base/test-context";

export class CharacteristicTestContext extends TestContext
{
    // characteristic = this.characteristic;   


    static fromData(data) 
    {
        log(`${this.prototype.constructor.name} - Retrieving Context Data`, {args : data});
        let context = foundry.utils.mergeObject(super.fromData(data), {characteristic : data.characteristic});
        log(`${this.prototype.constructor.name} - Context Data Retrieved`, {args : context});
        return context;
    }
}