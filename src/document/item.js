import ImpMalDocumentMixin from "./mixin";

export class ImpMalItem extends ImpMalDocumentMixin(Item)
{
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