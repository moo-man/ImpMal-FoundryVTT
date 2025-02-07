import { CorruptionMessageModel } from "../../model/message/corruption";
import { RewardMessageModel } from "../../model/message/reward";
import socketHandlers from "../socket-handlers";

export default function() 
{
    Hooks.on("ready", () => 
    {
        if (game.settings.get("impmal", "disableTheme"))
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

        game.impmal.commands = new ChatCommands({
            reward : {
                description : "Post a Reward message to chat which can include XP and/or Solars",
                args : ["xp", "solars", "reason"],
                callback : (xp, solars, reason) => RewardMessageModel.postReward({xp, solars, reason})
            }, 
            corruption : {
                description : "Post a Corruption message to chat, providing a button to resist the corruption",
                args : ["exposure", "corruption", "source"],
                callback : (exposure, corruption, source) => CorruptionMessageModel.postCorruption(exposure, {corruption, source})
            },
        })

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