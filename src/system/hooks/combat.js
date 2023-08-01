
export default function()
{
    Hooks.on("renderCombatTracker", (app, html) =>
    {
        game.impmal.superiority._addSuperiorityField(app, html);
    });

    Hooks.on("preUpdateCombat", (combat, data) => 
    {
        // If new round, call startRound scripts
        if (data.round > 1  && combat.round <= data.round) // If new turn (but only going forward)
        {
            let actors = combat.combatants.map(a => a.actor).filter(a => a); 
            Promise.all(actors.map(a => a.runScripts("endRound"))).then(() => actors.map(a => a.runScripts("startRound", combat)));
        }


        // Call end turn scripts from old turn
        let oldTurn = combat.turns[combat.turn];
        oldTurn.actor?.runScripts("endTurn", combat);

        // Call start turn scripts for new turn
        let newTurn = combat.turns[data.turn];
        newTurn.actor?.runScripts("startTurn", combat);

        // TODO guard against going backwards? 
    });

    Hooks.on("combatStart", (combat) => 
    {
        combat.combatants.map(a => a.actor).filter(a => a).map(a => a.runScripts("startRound", combat)); 
    });
}