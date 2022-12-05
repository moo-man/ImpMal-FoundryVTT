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


    computeBase() 
    {
        // Abstract
    }

    computeDerived() 
    {
        // Abstract
    }

    computeOwnerBase() 
    {
        // Abstract
    }

    computeOwnerDerived() 
    {
        // Abstract
    }
}