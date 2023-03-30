import ZoneHelpers from "../zone-helpers";
import ZoneSettings from "../zone-settings";

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
            ZoneHelpers.checkDrawingUpdate(drawing.object, canvas.tokens.placeables);
        }
    });
}