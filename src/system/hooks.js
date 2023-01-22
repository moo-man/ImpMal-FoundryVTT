import chat from "./hooks/chat";
import ready from "./hooks/ready";
import targets from "./hooks/targets";

export default function() 
{
    ready();
    chat();
    targets();
}