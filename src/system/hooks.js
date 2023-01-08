import chat from "./hooks/chat";
import ready from "./hooks/ready";

export default function() 
{
    ready();
    chat();
}