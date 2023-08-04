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

    testLabel(path)
    {
        let test = getProperty(this, path);
        if (!test)
        {
            return "";
        }

        let config = game.impmal.config;
        
        let label = config.characteristics[test.characteristic];
        
        // Replace name from characteristic to skill if test specifies
        if (test.skill.key)
        {
            label = config.skills[test.skill.key];
        }
        // Add specialisation if available
        if (test.skill.specialisation)
        {
            label += ` (${test.skill.specialisation})`;
        }

        if (test.difficulty)
        {
            let difficulty = game.impmal.config.difficulties[test.difficulty];
            label = `${difficulty.name} (${difficulty.modifier >= 0 ? "+" : ""}${difficulty.modifier}) ${label}`;
        }

        return label;
    }

}