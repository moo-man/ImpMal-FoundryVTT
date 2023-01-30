export default function() 
{
    Hooks.on("preCreateItem", (item, data, options, user) => 
    {
        if (item.actor)
        {
            return item.actor.system.preCreateItem(item, data, options, user);
            // actor.system._checkComputedEffects(actor);
        }
    });

    Hooks.on("createItem", (item, options, user) => 
    {
        if (item.actor && game.user.id == user)
        {
            item.actor.system.onCreateItem(item, options, user);
        }
    });
}