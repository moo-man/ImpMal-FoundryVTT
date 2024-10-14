import ZoneSettings from "../../apps/zone-settings";

export default function() 
{
    Hooks.on("renderDrawingHUD", (app, html) => 
    {
        ZoneSettings._addZoneConfig(html, app.object.document);    
    });

    Hooks.on("updateDrawing", (drawing, data, options, user) => 
    {
        if (game.user.id == user)
        {
            ZoneHelpers.checkDrawingUpdate(drawing.object);
        }
    });

    Hooks.on("getDrawingConfigHeaderButtons", (app, buttons) => 
    {
        buttons.unshift(            
            {
                label : "Zone",
                class: "post",
                icon: "fa-regular fa-game-board-simple",
                onclick: () => new ZoneSettings(app.document).render(true)
            });
    });

    Hooks.on("renderDrawingConfig", (app, html) => 
    {
        html[0].classList.add("impmal");
    });
}