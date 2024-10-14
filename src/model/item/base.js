/**
 * Abstract class that interfaces with the Item class
 */
export class BaseItemModel extends BaseWarhammerItemModel 
{

    allowedConditions = [];  // What condition effects can exist on the item

    get id () 
    {
        return this.parent.id;
    }


    /**
     * Used by sheet dropdowns, posting to chat, and test details
     */
    async summaryData()
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