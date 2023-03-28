/**
 * Abstract class that interfaces with the Item class
 */
export class BaseItemModel extends foundry.abstract.DataModel 
{

    allowedConditions = [];

    get id () 
    {
        return this.parent.id;
    }

    static defineSchema() 
    {
        return {};
    }

    preCreateData()//data) 
    {
        return {};
    }

    preUpdateChecks(data)
    {
        return data;
    }

    updateChecks()
    {
        if (this.parent.actor)
        {
            this.parent.actor.system.updateChecks();
        }

        return {};
    }


    computeBase() 
    {
        // for(let field in this)
        // {
        //     if (typeof this[field].compute == "function")
        //     {
        //         this[field].compute();
        //     }
        // }
    }

    computeDerived() 
    {
        // Abstract
    }

    computeOwnerDerived() 
    {
        
    }

    // computeOwnerBase() 
    // {
    //     // Abstract
    // }

    // computeOwnerDerived() 
    // {
    //     // Abstract
    // }
}