import actor from "./hooks/actor";
import chat from "./hooks/chat";
import combat from "./hooks/combat";
import drawing from "./hooks/drawing";
import effects from "./hooks/effects";
import item from "./hooks/item";
import ready from "./hooks/ready";
import settings from "./hooks/settings";
import targets from "./hooks/targets";
import token from "./hooks/token";
import i18n from "./hooks/i18n";

export default function() 
{
    ready();
    actor();
    effects();
    chat();
    targets();
    settings();
    combat();
    token();
    item();
    i18n();
    drawing();
}