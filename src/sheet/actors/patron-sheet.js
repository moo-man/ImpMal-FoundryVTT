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

        data.effects = this.actor.effects.contents.concat(this.actor.items.reduce((prev, current) => prev.concat(current.effects.contents), []));
        return data;
    }


    activateListeners(html) 
    {
        super.activateListeners(html);
        if (!this.isEditable)
        {
            return;
        }
    }
}