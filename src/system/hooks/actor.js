export default function() 
{
    Hooks.on("updateActor", (actor, data, options, user) => 
    {
        if (game.user.id == user)
        {
            // actor.system._checkComputedEffects(actor);
        }
    });
}