import actor from "./hooks/actor";
import chat from "./hooks/chat";
import combat from "./hooks/combat";
import drawing from "./hooks/drawing";
import ready from "./hooks/ready";
import settings from "./hooks/settings";
import token from "./hooks/token";
import i18n from "./hooks/i18n";
import setup from "./hooks/setup";
import journal from "./hooks/journal";

export default function() 
{
    ready();
    actor();
    chat();
    settings();
    combat();
    token();
    i18n();
    drawing();
    setup();
    journal();

    Hooks.on("hotbarDrop", (hotbar, data, pos) => 
    {
        if (data.type == "Item")
        {
            game.impmal.utility.createMacro(data, pos);
            return false;
        }
    });
}