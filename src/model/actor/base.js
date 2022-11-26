/**
 * Abstract class that interfaces with the Actor class
 */
export class BaseActorModel extends foundry.abstract.DataModel 
{
    preCreateData(data) 
    {
        let preCreateData = {};
        if (!data.prototypeToken)
        {
            mergeObject(preCreateData, {
                "prototypeToken.name" : data.name,
            });
        }
        return preCreateData;
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