import {IMPMAL} from "./config";

export default function registerHandlebars() 
{
    // I don't really like this but whatever
    Handlebars.registerHelper("calc", function (arg1, op, arg2) 
    {
        try 
        {
            return (0, eval)((arg1 || 0) + op + (arg2 || 0));
        }
        catch
        {
            return "err";
        }
    });

    foundry.applications.handlebars.loadTemplates({
        slotsDisplay : "systems/impmal/templates/partials/slots.hbs",
        actorInfluence : "systems/impmal/templates/partials/influence.hbs",
        itemInfluence : "systems/impmal/templates/partials/item-influence.hbs",
        actions : "systems/impmal/templates/partials/actions.hbs",
        listEffect : "systems/impmal/templates/partials/list-effect.hbs",
        actorSlots : "systems/impmal/templates/partials/actor-slots.hbs",
        defendingAgainst : "systems/impmal/templates/partials/defending-against.hbs",
        itemTraits : "systems/impmal/templates/item/partials/item-traits.hbs",
        itemTest : "systems/impmal/templates/item/partials/item-test.hbs",
        itemDamage : "systems/impmal/templates/item/partials/item-damage.hbs",
        itemUse : "systems/impmal/templates/item/partials/item-use.hbs",
    })
}