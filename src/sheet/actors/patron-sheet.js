import ImpMalActorSheet from "./actor-sheet";

export default class ImpMalPatronSheet extends ImpMalActorSheet
{

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat("patron");
        return options;
    }

    async getData()
    {
        let data = await super.getData();
        if (!game.user.isGM)
        {
            data.items.boonLiability = data.items.boonLiability.filter(i => i.system.visible);
        }
        return data;
    }


    activateListeners(html) 
    {
        super.activateListeners(html);
    }
}