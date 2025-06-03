import { ItemUse } from "../../system/tests/item/item-use";

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

    async use()
    {
        ItemUse.fromData({id : this.parent.id, uuid : this.parent.uuid, actor : this.parent.actor}).sendToChat();
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