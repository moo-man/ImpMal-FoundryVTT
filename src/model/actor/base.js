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
    
    async preCreateData(data) 
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

    allowCreation()
    {
        return true;
    }

    initialize() 
    {

    }

    async preUpdateChecks(data)
    {
        return data;
    }

    async updateChecks()
    {
        return {};
    }

    createChecks()
    {
        
    }

    itemIsAllowed(item)
    {
        if (this.constructor.preventItemTypes.includes(item.type))
        {
            ui.notifications.error(game.i18n.localize("IMPMAL.ItemsNotAllowed"), {type : item.type});
            return false;
        }
        else 
        {
            return true;
        }
    }
    
    checkSingletonItems(item)
    {
        if (this.constructor.singletonItemTypes.includes(item.type))
        {
            return item.actor.update({[`system.${item.type}`] : this[item.type].updateSingleton(item)});
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