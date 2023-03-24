import { SocketHandlers } from "../socket-handlers";
import { BaseTest } from "../tests/base/base-test";

export default function() 
{
    Hooks.on("ready", () => 
    {
        BaseTest._addMessageTestGetter();
        SocketHandlers.register();
    });
}