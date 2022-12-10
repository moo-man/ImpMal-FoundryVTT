let fields = foundry.data.fields;
/**
 * Abstract class that interfaces with the Actor class
 */
export class BaseActorModel extends foundry.abstract.DataModel 
{

    static defineSchema() 
    {
        let schema = {};
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

    initialize() 
    {

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
        this.initialize();
    }

    computeDerived() 
    {
        // Abstract
    }
}