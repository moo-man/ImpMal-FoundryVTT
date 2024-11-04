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

        data.enriched.items = await this.enrichItemDescriptions(data);

        data.effects = this.actor.effects.contents.concat(this.actor.items.reduce((prev, current) => prev.concat(current.effects.contents), [])).filter(e => e.system.transferData.documentType != "character");
        return data;
    }


    async enrichItemDescriptions(data)
    {
        let enrichedItems = {};
        for (let i of data.items.boonLiability)
        {
            enrichedItems[i.id] = await TextEditor.enrichHTML(i.system.notes.player, {async: true});
            if (game.user.isGM)
            {
                enrichedItems[i.id] += await TextEditor.enrichHTML(i.system.notes.gm, {async: true});
            }
        }
        return enrichedItems;
    }

    activateListeners(html) 
    {
        super.activateListeners(html);
        html.find(".faction-visibility").on("click", this._onFactionToggle.bind(this));
        html.find(".liability-visibility").on("click", this._onLiabilityToggle.bind(this));
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

    async _onLiabilityToggle(ev)
    {
        let document = await this._getDocument(ev)
        document.update({"system.visible" : !document.system.visible});
    }

    _onSummaryToggle(ev)
    {
        let el = $(ev.currentTarget);
        el.toggleClass("expanded");
    }
}