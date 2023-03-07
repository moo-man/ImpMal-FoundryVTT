import actor from "./hooks/actor";
import chat from "./hooks/chat";
import combat from "./hooks/combat";
import item from "./hooks/item";
import ready from "./hooks/ready";
import settings from "./hooks/settings";
import setup from "./hooks/setup";
import targets from "./hooks/targets";
import token from "./hooks/token";

export default function() 
{
    ready();
    actor();
    chat();
    targets();
    settings();
    combat();
    token();
    item();
    setup();
}