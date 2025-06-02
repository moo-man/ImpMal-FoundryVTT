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
                defaultArg : "xp",
                callback : (xp, solars, reason) => RewardMessageModel.postReward({xp, solars, reason})
            }, 
            corruption : {
                description : "Post a Corruption message to chat, providing a button to resist the corruption",
                args : ["exposure", "corruption", "source"],
                defaultArg : "exposure",
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

            ChatMessage.create({
                content: `
                <h1>New Users - Read This!</h1>
                <p>Welcome! Before you dive in, it may be best to browse the Wiki, below are some important topics:</p>
                <ul>
                <li><p><a href="https://moo-man.github.io/ImpMal-FoundryVTT/pages/faq.html">FAQ</a></p></li>
                <li><p><a href="https://moo-man.github.io/ImpMal-FoundryVTT/pages/premium.html">Premium Content</a> (this will tell you how to use any official content you've purchased!</p></li>
                <li><p><a href="https://moo-man.github.io/ImpMal-FoundryVTT/pages/troubleshooting.html">Troubleshooting</a></p></li>
                </ul>
                <p><strong>Note</strong>: The Wiki is still heavily WIP, having just been created.</p>
                <p><strong>Also Note</strong>: Character Creation has not been converted to AppV2 yet (see below), until then, it may have styling issues and bugs!</p>
                <hr>
                <h1>Imperium Maledictum in Foundry V13</h1>
                <p>As Foundry itself progresses in its adoption of its new application framework, so too has the IM system. All sheets and applications have been converted to use AppV2, my hope is that I have covered all existing functionality, but it is inevitable that more complex sheets (such as Actor sheets) may be missing some features here and there. Please be patient as I work through issues that arise!
                <ul>
                    <li><p>Actor and Item Sheets in V2 have had their <em>right click</em> functionalities greatly expanded. You can right click any owned Item or Active Effect to see a context menu for various actions.</p></li>
                    <li><p>Module Initialization has been centralized in the System settings, check the wiki link above!</p></li>
                </ul>`
            })
            game.settings.set("impmal", "systemMigrationVersion", game.system.version)

            //  No Need to migrate, just show message
            if (foundry.utils.isNewerVersion("2.0.0", game.settings.get("impmal", "systemMigrationVersion")))
            {
                game.impmal.migration.migrateWorld(true, true);
            }
        }
    });
}