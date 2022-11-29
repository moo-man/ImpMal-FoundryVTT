export default class ImpMalActorSheet 
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes.push("impmal");
        options.width = 600;
        options.height = 900;
        options.resizable = true;
        options.tabs = [{ navSelector: "", contentSelector: "", initial: "" }];
        return options;
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