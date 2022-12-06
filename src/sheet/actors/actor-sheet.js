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
        data.hitLocations = this.formatHitLocations(data);
        return data;
    }


    organizeItems(data) 
    {
        let sheetItems = data.actor.itemCategories;
        return sheetItems;
    }

    formatHitLocations(data) 
    {
        if (data.actor.system.combat?.hitLocations) 
        {
            return Object.values(data.actor.system.combat.hitLocations)
                .sort((a, b) => a.range[0] - b.range[0])
                .map(i => 
                {
                    if (i.range[0] != i.range[1]) 
                    {
                        i.displayRange = `${i.range[0]}-${i.range[1]}`;
                    }
                    else 
                    {
                        i.displayRange = i.range[0];
                    }
                    return i;
                });
        }
    }


    activateListeners(html) 
    {
        super.activateListeners(html);

        html.find("");
    }
}