import RewardDialog from "../../apps/reward-dialog";
import { RewardMessageModel } from "../../model/message/reward";
import ImpMalActorSheet from "./actor-sheet";

const DialogV2 = foundry.applications.api.DialogV2;

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

        data.effects = this.actor.effects.contents.concat(this.actor.items
            .reduce((prev, current) => prev.concat(current.effects.contents), [])
            .filter(e => e.parent.type == "boonLiability" ? e.parent.system.visible : true))
            .filter(e => e.system.transferData.documentType != "character");
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
        html.find(".post-reward").on("click", this._payUnderlings.bind(this));
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

    async _payUnderlings()
    {
        let patron = this.actor
        let defaultPay = patron.system.payment.value;
        
        let reward = await RewardDialog.prompt({solars: defaultPay, reason : `Payment from ${patron.name}`});
        reward.patron = patron;
        
        RewardMessageModel.postReward(reward);
    }
}