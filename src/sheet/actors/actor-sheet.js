export default class ImpMalActorSheet extends ActorSheet
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "actor"]);
        options.resizable = true;
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }];
        return options;
    }

    get template() 
    {
        return `systems/impmal/templates/actor/${this.actor.type}-sheet.hbs`;
    }

    async getData() 
    {
        let data = super.getData();
        data.system = data.actor.system;
        data.items = this.organizeItems(data);
        return data;
    }


    organizeItems(data) 
    {
        let sheetItems = data.actor.itemCategories;
        return sheetItems;
    }

    activateListeners(html) 
    {
        super.activateListeners(html);

        html.find("");
    }
}