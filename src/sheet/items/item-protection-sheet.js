import ImpMalItemSheet from "./item-sheet";

export default class ProtectionItemSheet extends ImpMalItemSheet
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["protection"]);
        return options;
    }

    activateListeners(html) 
    {
        super.activateListeners(html);

        html.find("");
    }
}