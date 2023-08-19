import ImpMalDocumentMixin from "./mixin";

export class ImpMalItem extends ImpMalDocumentMixin(Item)
{

    async _preCreate(data, options, user)
    {
        let allowed = await super._preCreate(data, options, user);

        if (!allowed)
        {
            return allowed;
        }

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

    async _onUpdate(data, options, user)
    {
        await super._onUpdate(data, options, user);

        // If an owned item is updated, run actor update scripts
        if (this.actor)
        {
            await this.actor.runScripts("updateDocument");
        }

        // Add a prepared flag to determine if this item has already been prepared
        // See https://github.com/foundryvtt/foundryvtt/issues/7987
        this.prepared = false;
        this.reset();
    }

    async _onCreate(data, options, user)
    {
        await super._onCreate(data, options, user);

        if (this.actor)
        {
            // Some items can only exist once in an actor (like faction)
            await this.actor.system.checkSingletonItems(this);
            
            // If an owned item is created, run actor update scripts
            await this.actor.runScripts("updateDocument");
        }
    }

    prepareBaseData() 
    {
        this.system.computeBase();
        this.runScripts("prepareBaseData", this);
    }

    prepareDerivedData() 
    {
        this.runScripts("prePrepareDerivedData", this);
        this.system.computeDerived();
        this.runScripts("postPrepareDerivedData", this);
    }

    prepareOwnedData()
    {
        if (!this.actor)
        {
            throw new Error("Cannot compute owned derived data without parent actor", this);
        }
        this.system.computeOwnerDerived(this.actor);
        this.runScripts("prepareOwnedData", this);

        this.prepared = true;
    }

    getScripts(trigger)
    {
        let effects = this.effects.contents.
            filter(effect => 
                effect.applicationData.type == "document" && 
                effect.applicationData.options.documentType == "Item" && 
                !effect.disabled)
            .concat(this.system.getOtherEffects());

        let fromActor = this.actor?.getScriptsApplyingToItem(this) || [];

        return effects.reduce((prev, current) => prev.concat(current.scripts), []).concat(fromActor).filter(i => i.trigger == trigger);
    }

    runScripts(...args)
    {
        if (!this.prepared)
        {
            return super.runScripts(...args);
        }
    }


    getTestData() 
    {
        let itemTestData = {};
        if (["trait", "talent", "equipment"].includes(this.type))
        {
            itemTestData = this.system.test.toObject();
        }
        else if (this.type == "power")
        {
            itemTestData = this.system.opposed.toObject();
        }
        return itemTestData; 
    }

    get damageEffects() 
    {
        return this._getTypedEffects("damage");
    }

    get targetEffects() 
    {
        // "follow" type zone effects should be applied to a token, not the zone
        return this._getTypedEffects("target").concat(this._getTypedEffects("zone").filter(e => e.applicationData.options.zoneType == "follow" && !e.applicationData.options.selfZone));
    }

    get zoneEffects() 
    {
        // "follow" type zone effects should be applied to a token, not the zone
        return this._getTypedEffects("zone").filter(e => e.applicationData.options.zoneType != "follow");
    }

    _getTypedEffects(type)
    {
        let effects = this.effects.contents.filter(effect => 
            effect.applicationData.type == type && 
            !effect.disabled);

        return effects;
    }

    // This function runs the immediate scripts an Item contains in its effects
    // when the Item is added to an Actor. 
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