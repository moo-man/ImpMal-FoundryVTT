/**
 * Abstract class that interfaces with the Item class
 */
export class BaseItemModel extends foundry.abstract.DataModel 
{

    allowedConditions = [];  // What condition effects can exist on the item
    allowedEffectApplications = Object.keys(game.impmal.config.effectApplications);
    effectApplicationOptions = {};


    get id () 
    {
        return this.parent.id;
    }

    static defineSchema() 
    {
        return {};
    }

    allowCreation()
    {
        if (this.parent.actor)
        {
            return this.parent.actor.system.itemIsAllowed(this.parent);
        }
        else 
        {
            return true;
        }
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
            this.parent.actor.update(this.parent.actor.system.updateChecks({}, {}));
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

    /**
     * Get effects from other sources, like weapon modifications
     * 
     */
    getOtherEffects()
    {
        return [];
    }



    /**
     * Used by sheet dropdowns, posting to chat, and test details
     */
    summaryData()
    {
        return {
            notes : "",
            gmnotes : "",
            details : {
                physical : "",
                item : {

                }
            },
            tags : [],
            summaryLabel : game.i18n.localize("IMPMAL.Description")
        };
    }
}