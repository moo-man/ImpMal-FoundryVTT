import { SocketHandlers } from "../socket-handlers";

export default function() 
{
    Hooks.on("ready", () => 
    {
        SocketHandlers.register();
        Object.defineProperty(User.prototype, "isPrimaryGM", {
            get : function isPrimaryGM() 
            {
                return game.users.find(u => u.isGM && u.active).id == game.user.id;
            }
        });
    });
}