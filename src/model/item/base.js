/**
 * Abstract class that interfaces with the Item class
 */
export class BaseItemModel extends foundry.abstract.DataModel 
{
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
}