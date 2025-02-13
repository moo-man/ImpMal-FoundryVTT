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


    loadTemplates([
        "systems/impmal/templates/actor/tabs/npc/npc-main.hbs",
        "systems/impmal/templates/actor/tabs/patron/patron-effects.hbs",
        "systems/impmal/templates/actor/tabs/patron/patron-main.hbs",
        "systems/impmal/templates/actor/tabs/actor-notes.hbs",
        "systems/impmal/templates/actor/tabs/actor-combat.hbs",
        "systems/impmal/templates/actor/tabs/actor-effects.hbs",
        "systems/impmal/templates/actor/tabs/actor-powers.hbs",
        "systems/impmal/templates/actor/tabs/actor-skills.hbs",
        "systems/impmal/templates/actor/tabs/actor-talents.hbs",
        "systems/impmal/templates/actor/tabs/actor-equipment.hbs",
        "systems/impmal/templates/actor/tabs/character/character-main.hbs",
        "systems/impmal/templates/actor/tabs/character/character-notes.hbs",
        "systems/impmal/templates/actor/tabs/vehicle/vehicle-cargo.hbs",
        "systems/impmal/templates/actor/tabs/vehicle/vehicle-main.hbs",
        "systems/impmal/templates/item/partials/item-character-notes.hbs",
        "systems/impmal/templates/item/partials/item-damage.hbs",
        "systems/impmal/templates/item/partials/item-effects.hbs",
        "systems/impmal/templates/item/partials/item-header.hbs",
        "systems/impmal/templates/item/partials/item-notes.hbs",
        "systems/impmal/templates/item/partials/item-patron-notes.hbs",
        "systems/impmal/templates/item/partials/item-traits.hbs",
        "systems/impmal/templates/item/partials/item-choices.hbs",
        "systems/impmal/templates/item/partials/item-summary.hbs",
        "systems/impmal/templates/item/partials/item-test.hbs",
        "systems/impmal/templates/item/partials/item-locations.hbs",
        "systems/impmal/templates/chat/rolls/opposedTest.hbs",
        "systems/impmal/templates/actor/partials/defendingAgainst.hbs",
        "systems/impmal/templates/actor/partials/influence.hbs",
        "systems/impmal/templates/actor/partials/actions.hbs",
        "systems/impmal/templates/item/partials/influence.hbs"
    ]);

    loadTemplates({
        slotsDisplay : "systems/impmal/templates/partials/slots.hbs",
        slotsActorDisplay : "systems/impmal/templates/partials/slots-actor.hbs"
    })
}