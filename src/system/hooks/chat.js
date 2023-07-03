import { ImpMalItem } from "../../document/item";
import { BaseTest } from "../tests/base/base-test";

export default function()
{
    /**
 * Add right click option to damage chat cards to allow application of damage
 * Add right click option to use fortune point on own rolls
 */
    Hooks.on("getChatLogEntryContext", (html, options) =>
    {
        BaseTest._addTestContextOptions(options);
    });

    Hooks.on("renderChatLog", (app, html,) => 
    {
        BaseTest._chatListeners(html);
    });

    Hooks.on("renderChatMessage", (app, html,) => 
    {
        ImpMalItem.itemPostListeners(html);
    });

    Hooks.on("createChatMessage", (message) => 
    {
        message.test?.context?.handleOpposed(message);
    });

    Hooks.on("updateChatMessage", (message, data, options) => 
    {
        message.test?.context?.handleOpposed(message, options);
    });
}