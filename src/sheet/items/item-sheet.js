export default class ImpMalItemSheet extends ItemSheet
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes.push("impmal");
        options.width = 400;
        options.height = 600;
        options.resizable = true;
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }];
        return options;
    }

    get template() 
    {
        return `systems/impmal/templates/item/item-${this.type}.hbs`;
    }

    async getData() 
    {
        let data = super.getData();
        data.system = data.actor.system;
        return data;
    }

    activateListeners(html) 
    {
        super.activateListeners(html);

        html.find("");
    }
}