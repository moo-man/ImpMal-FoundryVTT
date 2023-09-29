import { BaseTest } from "../base/base-test";
import { ItemUseContext } from "./item-context";

class ItemTestEvaluator
{

}

/**
 * This is an odd and not quite intuitive extension of the test class
 * It is intended for using Items such as talents that don't inolve a roll
 * but should still be "posted" to chat
 */
export class ItemUse extends BaseTest 
{
    static evaluatorClass = ItemTestEvaluator;
    static contextClass = ItemUseContext;
    rollTemplate = "systems/impmal/templates/chat/rolls/item-use.hbs";
    static chatType = CONST.CHAT_MESSAGE_TYPES.NONE;

    computeTarget() 
    {
        return 0;
    }

    async roll() 
    {
        return this;
    }


    static fromData({id, uuid, actor}) 
    {
        let item = fromUuidSync(uuid) || actor.items.get(id);

        let speaker = ChatMessage.getSpeaker({actor});
        if (!actor.token)
        {
            // getSpeaker retrieves tokens even if this sheet isn't a token's sheet
            delete speaker.scene;
        }

        // Much is copied from test-dialog setupData
        let contextData = {
            speaker,
            title : item.name,
            targets : Array.from(game.user.targets).filter(t => t.document.id != speaker.token),
            uuid, 
            item
        };

        if (!actor.token)
        {
            // getSpeaker retrieves tokens even if this sheet isn't a token's sheet
            delete contextData.speaker.scene;
        }


        return new this({
            data:  {},
            context : this.contextClass.fromData(contextData),
        });
    }
}
