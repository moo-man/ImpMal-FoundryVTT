/**
 * Abstract class that interfaces with the Actor class
 */
export class BaseActorModel extends foundry.abstract.DataModel 
{

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.notes = new fields.SchemaField({
            player : new fields.StringField(),
            gm : new fields.StringField()
        });

        return schema;
    }

    
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