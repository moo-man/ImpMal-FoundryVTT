/**
 * Abstract class that interfaces with the Item class
 */
export class BaseItemModel extends foundry.abstract.DataModel 
{
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
        return {};
    }


    computeBase() 
    {
        for(let field in this)
        {
            if (typeof this[field].compute == "function")
            {
                this[field].compute();
            }
        }
    }

    computeDerived() 
    {
        // Abstract
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