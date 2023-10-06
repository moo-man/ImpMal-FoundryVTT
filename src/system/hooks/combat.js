
export default function()
{
    Hooks.on("renderCombatTracker", (app, html) =>
    {
        game.impmal.superiority._addSuperiorityField(app, html);


        // If no token resource is being tracked, display the action the actor took
        let cElements = Array.from(html.find(".combatant"));
        cElements.map(c => $(c)).forEach(c =>  
        {
            let actor = game.combat.combatants.get(c[0].dataset.combatantId)?.actor;
            if (actor && actor.system.combat.action && c.find(".token-resource").length == 0)
            {
                $(`<div class="token-resource"><span class="resource">${actor.system.combat.action}</span></div>`).insertAfter(c.find(".token-name"));
            }
        });

    });

    Hooks.on("preUpdateCombat", (combat, data) => 
    {
        // If new round, call startRound scripts
        if (data.round > 1  && combat.round <= data.round) // If new turn (but only going forward)
        {
            let actors = combat.combatants.map(a => a.actor).filter(a => a); 
            Promise.all(actors.map(a => a.clearAction())).then(actors => 
            {
                Promise.all(actors.map(a => a.runScripts("endRound"))).then(() => 
                {
                    actors.map(a => a.runScripts("startRound", combat, {itemEffects : true}));
                });
            });
        }


        // Call end turn scripts from old turn
        let oldTurn = combat.turns[combat.turn];
        oldTurn?.actor?.runScripts("endTurn", combat, {itemEffects : true});

        // Call start turn scripts for new turn
        let newTurn = combat.turns[data.turn];
        newTurn.actor?.runScripts("startTurn", combat, {itemEffects : true});

        // TODO guard against going backwards? 
    });

    Hooks.on("combatStart", (combat) => 
    {
        Promise.all(combat.combatants.map(c => c.actor?.clearAction())).forEach(a => a?.runScripts("startRound", combat, {itemEffects : true})); 
    });
}