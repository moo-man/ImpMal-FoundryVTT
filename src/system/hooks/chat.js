import { PostedItemMessageModel } from "../../model/message/item";
import ChatHelpers from "../chat-helpers";
import { ImpMalChatMessage } from "../chat-message";

export default function()
{
    /**
 * Add right click option to damage chat cards to allow application of damage
 * Add right click option to use fortune point on own rolls
 */
    Hooks.on("getChatMessageContextOptions", (html, options) =>
    {
        ImpMalChatMessage.addTestContextOptions(options);
    });
}