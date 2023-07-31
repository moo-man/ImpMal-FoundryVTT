import ImpMalDocumentMixin from "./mixin";

export class ImpMalItem extends ImpMalDocumentMixin(Item)
{

    async _preCreate(data, options, user)
    {
        await super._preCreate(data, options, user);

        // If this item was added from an effect, mark it so it can be deleted along with the effect
        if (options.fromEffect)
        {
            this.updateSource({"flags.impmal.fromEffect" : options.fromEffect});
        }

        //_preCreate for effects is where immediate scripts run
        // Effects that come with Items aren't called, so handle them here
        await this.handleImmediateScripts();
    }

    async _onDelete()
    {
        for(let effect of this.effects)
        {
            await effect.deleteCreatedItems();
        }
    }

    prepareBaseData() 
    {
        this.system.computeBase();
        this.runScripts("prepareBaseData");
    }

    prepareDerivedData() 
    {
        this.runScripts("prePrepareDerivedData");
        this.system.computeDerived();
        this.runScripts("postPrepareDerivedData");
    }

    prepareOwnedData()
    {
        if (!this.actor)
        {
            throw new Error("Cannot compute owned derived data without parent actor", this);
        }
        this.system.computeOwnerDerived(this.actor);
    }

    getScripts(trigger)
    {
        let effects = this.effects.contents.filter(effect => 
            effect.applicationData.type == "document" && 
            effect.applicationData.options.documentType == "Item" && 
            !effect.disabled);

        return effects.reduce((prev, current) => prev.concat(current.scripts.filter(i => i.trigger == trigger)), []);
    }

    async handleImmediateScripts()
    {
        let effects = this.effects.contents.filter(effect => 
            effect.applicationData.type == "document" && 
            effect.applicationData.options.documentType == "Actor" && // We're looking for actor because if the immediate script was for the Item, 
            !effect.disabled);                                        // it would've been called when it was created. 

        let scripts = effects.reduce((prev, current) => prev.concat(current.scripts.filter(i => i.trigger == "immediate")), []);

        await Promise.all(scripts.map(s => s.execute()));
    }

    get typeLabel()
    {
        return game.i18n.localize(CONFIG.Item.typeLabels[this.type]);
    }

    async postItem()
    {
        let summary = await renderTemplate("systems/impmal/templates/item/partials/item-summary.hbs", this.system.summaryData());
        let content = await renderTemplate("systems/impmal/templates/chat/item-post.hbs", {name : this.name, img : this.img, summary});
        ChatMessage.create({
            content,
            flags: {
                impmal: {
                    itemData : this.toObject()
                }
            }
        });
    }

    static itemPostListeners(html)
    {
        let id = html[0].dataset.messageId;
        let message = game.messages.get(id);
        let post = html.find(".item-post")[0];
        if (post)
        {
            post.draggable = true; 
            post.addEventListener("dragstart", ev => 
            {
                ev.dataTransfer.setData("text/plain", JSON.stringify({type : "Item", data : message.getFlag("impmal", "itemData")}));
            });

        }
    }
}