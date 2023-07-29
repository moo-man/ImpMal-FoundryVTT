import {IMPMAL} from "./config";

export default function registerHandlebars() 
{
    Handlebars.registerHelper("isGM", function () 
    {
        return game.user.isGM;
    });


    Handlebars.registerHelper("config", function (key) 
    {
        return IMPMAL[key];
    });

    Handlebars.registerHelper("configLookup", function (obj, key) 
    {
        return getProperty(IMPMAL[obj], key);
    });

    Handlebars.registerHelper("array", function (array, cls) 
    {
        if (typeof cls == "string") 
        {
            return array.map(i => `<a class="${cls}">${i}</a>`).join(`<span class="array-comma">,</span>`);
        }
        else 
        {
            return array.join(", ");
        }
    });

    Handlebars.registerHelper("includes", function(array, value) 
    {
        return array.includes(value);
    });

    
    Handlebars.registerHelper("settings", function (key) 
    {
        return game.settings.get("impmal", key);
    });

    Handlebars.registerHelper("pct", function (part, whole, max100=true) 
    {
        let pct =  (part / whole) * 100;
        if (pct > 100 && max100)
        {
            pct = 100;
        }
        return pct;
    });

    Handlebars.registerHelper("hasProperty", function (obj, key) 
    {
        return hasProperty(obj, key);
    });

    Handlebars.registerHelper("tokenImg", function (actor) 
    {
        try 
        {
            return actor.token ? actor.token.texture.src : actor.prototypeToken.texture.src;
        }
        catch (e) 
        {
            // do nothing
        }
    });

    Handlebars.registerHelper("tokenName", function (actor) 
    {
        try 
        {
            return actor.token ? actor.token.name : actor.prototypeToken.name;
        }
        catch (e) 
        { 
            // Do nothing
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
        "systems/impmal/templates/item/partials/item-character-notes.hbs",
        "systems/impmal/templates/item/partials/item-damage.hbs",
        "systems/impmal/templates/item/partials/item-effects.hbs",
        "systems/impmal/templates/item/partials/item-header.hbs",
        "systems/impmal/templates/item/partials/item-notes.hbs",
        "systems/impmal/templates/item/partials/item-patron-notes.hbs",
        "systems/impmal/templates/item/partials/item-traits.hbs",
        "systems/impmal/templates/item/partials/item-choices.hbs",
        "systems/impmal/templates/item/partials/item-summary.hbs",
        "systems/impmal/templates/chat/rolls/opposedTest.hbs",
        "systems/impmal/templates/actor/partials/defendingAgainst.hbs",
        "systems/impmal/templates/actor/partials/influence.hbs",
        "systems/impmal/templates/item/partials/influence.hbs",
    ]);
}