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
}