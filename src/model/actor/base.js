let fields = foundry.data.fields;
/**
 * Abstract class that interfaces with the Actor class
 */
export class BaseActorModel extends foundry.abstract.DataModel 
{

    static preventItemTypes = [];
    static singletonItemTypes = [];
    
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

    preCreateItem(item)
    {
        if (this.constructor.preventItemTypes.includes(item.type))
        {
            ui.notifications.error("IMPMAL.ItemsNotAllowed", {type : item.type});
            return false;
        }
    }
    
    onCreateItem(item)
    {
        if (this.constructor.singletonItemTypes.includes(item.type))
        {
            item.actor.update({[`system.${item.type}`] : this[item.type].updateSingleton(item)});
        }
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