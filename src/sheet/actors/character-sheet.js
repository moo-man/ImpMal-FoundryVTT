import ImpMalActorSheet from "./actor-sheet";

export default class ImpMalCharacterSheet extends ImpMalActorSheet
{

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat("character");
        return options;
    }


    activateListeners(html) 
    {
        super.activateListeners(html);

        html.find("");
    }
}