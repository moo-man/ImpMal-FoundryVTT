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
            for(let faction in data.system.influence.factions)
            {
                data.system.influence.factions[faction].hide = data.system.influence.factions[faction].hidden;
            }
        }

        data.effects = this.actor.effects.contents.concat(this.actor.items.reduce((prev, current) => prev.concat(current.effects.contents), [])).filter(e => e.applicationData.options.documentType != "character");
        return data;
    }


    activateListeners(html) 
    {
        super.activateListeners(html);
        html.find(".faction-visibility").on("click", this._onFactionToggle.bind(this));
        html.find(".summary").on("click", this._onSummaryToggle.bind(this));
        if (!this.isEditable)
        {
            return;
        }
    }

    _onFactionToggle(ev)
    {
        ev.stopPropagation();
        let path = this._getPath(ev);
        let faction = this._getType(ev);

        this.object.update(getProperty(this.object, path).toggleFactionVisibility(faction, path));

    }

    _onSummaryToggle(ev)
    {
        let el = $(ev.currentTarget);
        el.toggleClass("expanded");
    }
}