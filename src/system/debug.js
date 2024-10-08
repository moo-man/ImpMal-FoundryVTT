
export default function() 
{
    document.addEventListener("keydown", (ev) => 
    {
        if (ev.key == "F12")
        {
            console.log(`%c+++|Welcome, Tech Priest|+++`, "color: #DDD;background: #065c63;font-weight:bold");
        }
    });

    Hooks.on("renderApplication", (app, html, data) => 
    {
        warhammer.utility.log(`Rendering ${app.constructor.name}`, {args : data});
    });

    Hooks.on("ready", () => 
    {
        // Add startup debug code here

    });
}