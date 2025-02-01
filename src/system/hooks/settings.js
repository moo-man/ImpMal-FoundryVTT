
export default function()
{
    Hooks.on("updateSetting", (setting) =>
    {
        if (game.impmal.resources.isResource(setting.key))
        {
            game.impmal.resources.onResourceChanged(setting.key);
        }
    });
}