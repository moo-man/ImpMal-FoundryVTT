import { PostedItemMessageModel } from "../../model/message/item";
import ChatHelpers from "../chat-helpers";
import { ImpMalChatMessage } from "../chat-message";

export default function()
{
    /**
 * Add right click option to damage chat cards to allow application of damage
 * Add right click option to use fortune point on own rolls
 */
    Hooks.on("getChatLogEntryContext", (html, options) =>
    {
        ImpMalChatMessage.addTestContextOptions(options);
    });

    Hooks.on("renderChatLog", (app, html) => 
    {
        ImpMalChatMessage.chatListeners(html);
        ChatHelpers.addOpposedHighlightListeners(html);
    });

    Hooks.on("renderChatMessage", (app, html) => 
    {
        PostedItemMessageModel.itemPostListeners(html);
        ChatHelpers.removeGMOnlyElements(html);
        if (!app.isAuthor && !app.isOwner)
        {
            ChatHelpers.removeNonOwnerElements(html);
        }
    });

    Hooks.on("createChatMessage", (document, options, user) => {
        let reward = document.getFlag("impmal", "rewardReceived")
        if (reward && game.users.activeGM.id == game.user.id)
        {
            let source = game.messages.get(reward.source);
            if (source)
            {
                source.update({"system.receivedBy" : source.system.receivedBy.concat(reward.actor)})
            }
        }
    })
}