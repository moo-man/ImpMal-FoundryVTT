import chat from "./hooks/chat";
import combat from "./hooks/combat";
import ready from "./hooks/ready";
import settings from "./hooks/settings";
import targets from "./hooks/targets";

export default function() 
{
    ready();
    chat();
    targets();
    settings();
    combat();
}