import socketHandlers from "../socket-handlers";

export default function() 
{
    Hooks.on("ready", () => 
    {
        if (game.settings.get("wfrp4e", "disableTheme"))
        {
            document.body.classList.add("no-theme")
        }
        
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

        if(game.impmal.migration.shouldMigrate())
        {
            game.impmal.migration.migrateWorld(true, true);
        }
    });
}