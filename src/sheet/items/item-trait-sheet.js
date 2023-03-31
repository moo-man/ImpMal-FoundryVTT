import ImpMalItemSheet from "./item-sheet";

export default class TraitItemSheet extends ImpMalItemSheet
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["trait"]);
        return options;
    }

    activateListeners(html) 
    {
        super.activateListeners(html);
    }
}