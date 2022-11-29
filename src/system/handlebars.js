import IMPMAL from "./config";

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

    Handlebars.registerHelper("pct",
        function (part, whole) 
        {
            return (part / whole) * 100;
        });

    Handlebars.registerHelper("enrich", function (string) 
    {
        return TextEditor.enrichHTML(string);
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
        "systems/impmal/templates/actor/character/character-main.html",
    ]);
}