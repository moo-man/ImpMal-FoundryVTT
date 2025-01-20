import { AvailabilityDialog } from "../../apps/test-dialog/availability-dialog";
import { AvailabilityTest } from "../../system/tests/availability/availability-test";

export class PostedItemMessageModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let fields = foundry.data.fields;
        let schema = {};
        schema.itemData = new fields.ObjectField({});
        return schema;
    }

    static async postItem(item)
    {
        let summary = await renderTemplate("systems/impmal/templates/item/partials/item-summary.hbs", await item.system.summaryData());
        let content = await renderTemplate("systems/impmal/templates/chat/item-post.hbs", {name : item.name, img : item.img, summary, item});
        ChatMessage.create({
            content,
            type : "item",
            system : {
                itemData : item.toObject()
            }
        });
    }

    async rollAvailability()
    {
        let dialogData = AvailabilityDialog.setupData({availability : this.itemData.system.availability},null, {title : {append : " - " + this.itemData.name}});

        let setupData = await AvailabilityDialog.awaitSubmit(dialogData);

        let test = AvailabilityTest.fromData(setupData);
        await test.roll();
        test.sendToChat();
        return test;
    }
    
    static itemPostListeners(html)
    {
        let id = html[0].dataset.messageId;
        let message = game.messages.get(id);
        if (message.type == "item")
        {
            let post = html.find(".item-post")[0]
            post.draggable = true; 
            post.addEventListener("dragstart", ev => 
            {
                ev.dataTransfer.setData("text/plain", JSON.stringify({type : "Item", data : message.system.itemData}));
            });

        }
    }

    get item()
    {
        return new Item.implementation(this.itemData);
    }
}