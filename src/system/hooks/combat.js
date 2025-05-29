
export default function()
{
    Hooks.on("renderCombatTracker", (app, html) =>
    {
        game.impmal.resources.addResourceFields(app, html);


        // If no token resource is being tracked, display the action the actor took
        let cElements = Array.from(app.element.querySelectorAll(".combatant"));
        cElements.forEach(c =>  
        {
            let actor = game.combat.combatants.get(c.dataset.combatantId)?.actor;
            let resource = c.querySelector(".token-resource");
            if (actor && actor.system.combat.action && c.querySelector(".token-resource"))
            {   
                resource.textContent = game.impmal.config.actions[actor.system.combat.action].label;
            }
        });

    });
}