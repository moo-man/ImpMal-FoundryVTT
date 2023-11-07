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

    async preCreateData()//data) 
    {
        return {};
    }

    async preUpdateChecks(data)
    {
        return data;
    }

    async updateChecks()
    {
        if (this.parent.actor)
        {
            await this.parent.actor.update(await this.parent.actor.system.updateChecks({}, {}));
        }

        return {};
    }

    async createChecks()
    {
        
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
     * 
     */
    effectIsApplicable(effect)
    {
        return !effect.disabled;
    }

    // If an item effect is disabled it should still transfer to the actor, so that it's visibly disabled
    shouldTransferEffect()
    {
        return true;
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