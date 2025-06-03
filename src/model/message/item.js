import { AvailabilityDialog } from "../../apps/test-dialog/availability-dialog";
import { AvailabilityTest } from "../../system/tests/availability/availability-test";

export class PostedItemMessageModel extends WarhammerMessageModel
{
    static defineSchema() 
    {
        let fields = foundry.data.fields;
        let schema = {};
        schema.itemData = new fields.ObjectField({});
        return schema;
    }

    static async postItem(item, chatData={})
    {
        let summary = await renderTemplate("systems/impmal/templates/item/partials/item-summary.hbs", await item.system.summaryData());
        let content = await renderTemplate("systems/impmal/templates/chat/item-post.hbs", {name : item.name, img : item.img, summary, item});
        ChatMessage.create(foundry.utils.mergeObject({
            content,
            type : "item",
            system : {
                itemData : item.toObject()
            }
        }, chatData));
    }

    static get actions() 
    { 
        return foundry.utils.mergeObject(super.actions, {
            rollAvailability : this._onRollAvailability,
            buyItem :  this._onBuyItem
        });
    }

    async onRender(html) {

        let post = html.querySelector(".item-post")
        if (post)
        {
            post.draggable = true;
            post.addEventListener("dragstart", ev => {
                ev.dataTransfer.setData("text/plain", JSON.stringify({ type: "Item", data: this.itemData }));
            })
        }
    }

    static _onRollAvailability(ev, target)
    {
        this.rollAvailability();
    }

    static _onBuyItem(ev, target)
    {
        for(let actor of selectedWithFallback())
        {
            this.buyItem(actor);
        }
    }

    async rollAvailability()
    {
        let dialogData = AvailabilityDialog.setupData({item: new Item.implementation(this.itemData), availability : this.itemData.system.availability},null, {appendTitle : " - " + this.itemData.name});

        let setupData = await AvailabilityDialog.awaitSubmit(dialogData);

        let test = AvailabilityTest.fromData(setupData);
        await test.roll();
        return test;
    }

    buyItem(actor)
    {
        return this.constructor.buy(actor, this.itemData);
    }

    static async buy(actor, itemData)
    {
        if (!actor)
        {
            ui.notifications.error("IMPMAL.ErrorNoActorBuyItem", {localize: true});
        }
        if ((actor.system.solars) >= itemData.system.cost)
        {
            let confirm = await foundry.applications.api.DialogV2.confirm({
                window : {title : `${actor.name}`},
                content : `<p>Buy <strong>${itemData.name}</strong> for <strong>${itemData.system.cost} Solars</strong>?</p>`
            })

            if (confirm)
            {
                let newSolars = actor.system.solars - itemData.system.cost;
                ChatMessage.create({content : game.i18n.format("IMPMAL.BuySuccessful", {item : itemData.name, cost : itemData.system.cost}), speaker : {alias : actor.name}})
                await actor.update({"system.solars" : newSolars});
                await Item.implementation.create(itemData, {parent : actor});
            }
        }
        else
        {
            ui.notifications.error(game.i18n.format("IMPMAL.ErrorNotEnoughSolars", {name : actor.name}));
        }
    }


    get item()
    {
        return new Item.implementation(this.itemData);
    }
}