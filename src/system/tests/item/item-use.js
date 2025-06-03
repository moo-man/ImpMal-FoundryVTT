import { BaseTest } from "../base/base-test";
import { ItemUseContext } from "./item-context";

class ItemTestEvaluator
{
    static fromData()
    {
        return {};
    }
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

    computeTarget() 
    {
        return 0;
    }

    async roll() 
    {
        return this;
    }

    _formatBreakdown(breakdown)
    {
        return "";
    }

    get showChatTest() {
        let effects = this.targetEffects.concat(this.damageEffects).concat(this.zoneEffects);
    
        // Effects already prompt a test
        if (effects.some(e => e.system.transferData.avoidTest.value == "item"))
        {
          return false;
        }
        else
        {
          return this.context.itemTest.isValid
        }
      }
    


    static fromData({uuid, actor}) 
    {
        let speaker = ChatMessage.getSpeaker({actor});
        if (!actor.token)
        {
            // getSpeaker retrieves tokens even if this sheet isn't a token's sheet
            delete speaker.scene;
        }

        // Much is copied from test-dialog setupData
        let contextData = {
            speaker,
            targets : Array.from(game.user.targets).filter(t => t.document.id != speaker.token).map(t => t.actor.speakerData(t.document)),
            itemUsed : uuid
        };

        if (!actor.token)
        {
            // getSpeaker retrieves tokens even if this sheet isn't a token's sheet
            delete contextData.speaker.scene;
        }


        contextData.context = {};
        return new this({
            data:  {},
            context : this.contextClass.fromData(contextData),
        });
    }
}
