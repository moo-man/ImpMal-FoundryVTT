
export default function()
{
    Hooks.on("renderCombatTracker", (app, html) =>
    {
        game.impmal.resources.addResourceFields(app, html);


        // If no token resource is being tracked, display the action the actor took
        let cElements = Array.from(html.find(".combatant"));
        cElements.map(c => $(c)).forEach(c =>  
        {
            let actor = game.combat.combatants.get(c[0].dataset.combatantId)?.actor;
            if (actor && actor.system.combat.action && c.find(".token-resource").length == 0)
            {
                $(`<div class="token-resource"><span class="resource">${game.impmal.config.actions[actor.system.combat.action].label}</span></div>`).insertAfter(c.find(".token-name"));
            }
        });

    });
}