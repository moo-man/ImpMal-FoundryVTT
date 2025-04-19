import { PostedItemMessageModel } from "../model/message/item";
import ImpMalDocumentMixin from "./mixin";

export class ImpMalItem extends ImpMalDocumentMixin(WarhammerItem)
{

    async _preCreate(data, options, user)
    {
        let allowed = await super._preCreate(data, options, user);
        if (allowed == false)
        {
            return allowed;
        }
        if (this.isOwned)
        {
            await this._handleFactionChoice(data, options);
        }
    }

    async _onCreate(data, options, user)
    {
        await super._onCreate(data, options, user);

        if (game.user.id != user)
        {
            return;
        }
    }

    async _handleFactionChoice()
    {
        // All effects that specify faction influence
        let factionEffects = this.effects.filter(e => e.changes.find(c => c.key.includes("system.influence.factions")));

        for (let e of factionEffects)
        {
            let factionChanges = e.changes.filter(c => c.key.includes("system.influence.factions"));
            let nonFactionChanges = e.changes.filter(c => !c.key.includes("system.influence.factions"));
            let factions = {};

            // Count the factions 
            for(let change of factionChanges)
            {
                let faction = change.key.split(".")[3];
                if (!factions[faction])
                {
                    factions[faction] = 1;
                }
                else 
                {
                    factions[faction]++;
                }
            }


            // Prompt for a choice
            for (let key in factions)
            {
                let regex = key == "*" ? "." : key; // * should be any faction
                
                let factionOptions = Object.keys(game.impmal.config.factions).filter(faction => faction.match(regex)).map(i => { return {name : game.impmal.config.factions[i], id : i};});
                
                let choices = await ItemDialog.create(factionOptions, (factions[key] || 0), {text : "Select Faction(s)", title : this.name});

                factions[key] = choices.map(i => i.id);
            }

            // Count the factions 
            for(let change of factionChanges)
            {
                let faction = change.key.split(".")[3];
                if (factions[faction].length)
                {
                    change.key = `system.influence.factions.${(factions[faction].splice(0, 1))}.modifier`; // Currently only modifier is available to active effects
                }
            }

            e.updateSource({changes : factionChanges.concat(nonFactionChanges)});
        }
    }


    prepareDerivedData() 
    {
        this.runScripts("prePrepareDerivedData", this);
        if (this.isOwned)
        {
            this.actor.runScripts("prePrepareOwnedItemDerivedData", this);
        }
        this.system.computeDerived();
        this.runScripts("postPrepareDerivedData", this);
        if (this.isOwned)
        {
            this.actor.runScripts("postPrepareOwnedItemDerivedData", this);
        }
    }

    prepareOwnedData()
    {
        if (!this.actor)
        {
            throw new Error("Cannot compute owned derived data without parent actor", this);
        }
        this.system.computeOwned(this.actor);
        this.runScripts("prepareOwnedData", this);

        // this.prepared = true;
    }

    getTestData() 
    {
        let itemTestData = {};
        if (this.system.test)
        {
            itemTestData = this.system.test.toObject();
        }
        else if (this.type == "power")
        {
            itemTestData = this.system.opposed.toObject();
        }
        return itemTestData; 
    }

    get typeLabel()
    {
        return game.i18n.localize(CONFIG.Item.typeLabels[this.type]);
    }

    async postItem(chatData={})
    {
        PostedItemMessageModel.postItem(this, chatData);
    }
}