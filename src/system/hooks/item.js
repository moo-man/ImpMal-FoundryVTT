export default function() 
{
    Hooks.on("preCreateItem", (item, data, options, user) => 
    {
        if (item.actor)
        {

            if (item.type == "ammo" && item.system.custom)
            {
                ui.notifications.error("Custom ammo must be applied to another non-custom ammo type");
                return false; // TODO: Find a better place for this, perhaps move item checks to item models instead of actor models?
            }

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