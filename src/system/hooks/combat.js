
export default function()
{
    Hooks.on("renderCombatTracker", (app, html) =>
    {
        game.impmal.superiority._addSuperiorityField(app, html);
    });
}