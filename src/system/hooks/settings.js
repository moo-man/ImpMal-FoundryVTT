
export default function()
{
    Hooks.on("updateSetting", (setting) =>
    {
        if (setting.key == "impmal.superiority")
        {
            game.impmal.superiority._onSuperiorityChanged();
        }
    });
}