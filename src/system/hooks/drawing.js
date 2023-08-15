import ZoneSettings from "../../apps/zone-settings";
import ZoneHelpers from "../zone-helpers";

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