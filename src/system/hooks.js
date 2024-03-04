import actor from "./hooks/actor";
import chat from "./hooks/chat";
import combat from "./hooks/combat";
import drawing from "./hooks/drawing";
import ready from "./hooks/ready";
import settings from "./hooks/settings";
import targets from "./hooks/targets";
import token from "./hooks/token";
import i18n from "./hooks/i18n";
import setup from "./hooks/setup";
import journal from "./hooks/journal";
import loadScripts from "./hooks/loadScripts";

export default function() 
{
    ready();
    actor();
    chat();
    targets();
    settings();
    combat();
    token();
    i18n();
    drawing();
    setup();
    journal();
    loadScripts();

    Hooks.on("preCreateJournalEntry", _keepID);
    Hooks.on("preCreateScene", _keepID);
    Hooks.on("preCreateRollTable", _keepID);

    Hooks.on("hotbarDrop", (hotbar, data, pos) => 
    {
        if (data.type == "Item")
        {
            game.impmal.utility.createMacro(data, pos);
            return false;
        }
    });

    
    function _keepID(document, data, options)
    {
        options.keepId = game.impmal.utility._keepID(data._id, document);
    }
}