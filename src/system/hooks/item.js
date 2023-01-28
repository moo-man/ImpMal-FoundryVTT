export default function() 
{
    Hooks.on("updateItem", (item, data, options, user) => 
    {
        if (item.actor && game.user.id == user)
        {
            // actor.system._checkComputedEffects(actor);
        }
    });
}