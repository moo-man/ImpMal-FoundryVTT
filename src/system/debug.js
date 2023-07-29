import log from "./logger";

export default function() 
{
    document.addEventListener("keydown", (ev) => 
    {
        if (ev.key == "F12")
        {
            console.log(`%c+++|Welcome, Tech Priest|+++`, "color: #1c3132;background: #CCC;font-weight:bold");
        }
    });

    Hooks.on("renderApplication", (app, html, data) => 
    {
        log(`Rendering ${app.constructor.name}`, {args : data});
    });

    Hooks.on("ready", () => 
    {
        // Add startup debug code here

    });
}