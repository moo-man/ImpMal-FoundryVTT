import socketHandlers from "../socket-handlers";

export default function() 
{
    Hooks.on("ready", () => 
    {
        SocketHandlers.register(socketHandlers);
        Object.defineProperty(User.prototype, "isPrimaryGM", {
            get : function isPrimaryGM() 
            {
                return game.users.activeGM?.id == game.user.id;
            }
        });

        let tables = game.settings.get("impmal", "tableSettings") || {};
        if (!tables?.origin)
        {
            tables.origin = "nyaEnNOrR8Sq8Wf4";
            game.settings.set("impmal", "tableSettings", tables);
        }
    });
}