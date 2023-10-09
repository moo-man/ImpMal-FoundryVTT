import ImpMalItemSheet from "./item-sheet";

export default class ProtectionItemSheet extends ImpMalItemSheet
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        return options;
    }

    activateListeners(html) 
    {
        super.activateListeners(html);

        html.find(".fix-damage").click(() => 
        {
            this.item.update({"system.damage" : null}).then(() => this.item.update({"system.damage" : {}}));
        });
        

        html.find(".fix-rended").click(() => 
        {
            this.item.update({"system.rended" : null}).then(() => this.item.update({"system.rended" : {}}));
        });
    }
}