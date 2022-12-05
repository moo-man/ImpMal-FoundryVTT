export default class ImpMalItemSheet extends ItemSheet
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "item"]);
        options.width = 400;
        options.height = 600;
        options.resizable = true;
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }];
        return options;
    }

    get template() 
    {
        return `systems/impmal/templates/item/item-${this.item.type}.hbs`;
    }

    async getData() 
    {
        let data = super.getData();
        data.system = data.item.system;
        data.isPhysical = Object.keys(game.template.Item).filter(i => game.template.Item[i].templates?.includes("physical")).includes(data.item.type);
        return data;
    }

    activateListeners(html) 
    {
        super.activateListeners(html);

        html.find("");
    }
}