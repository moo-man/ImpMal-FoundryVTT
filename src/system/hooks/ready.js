import { SocketHandlers } from "../socket-handlers";
import { BaseTest } from "../tests/base/base-test";

export default function() 
{
    Hooks.on("ready", () => 
    {
        BaseTest._addMessageTestGetter();
        SocketHandlers.register();
        Object.defineProperty(User.prototype, "isPrimaryGM", {
            get : function isPrimaryGM() 
            {
                return game.users.find(u => u.isGM && u.active).id == game.user.id;
            }
        });
    });
}