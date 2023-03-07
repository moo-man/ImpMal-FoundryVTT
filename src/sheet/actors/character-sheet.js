import { AdvancementForm } from "../../apps/advancement";
import ImpMalActorSheet from "./actor-sheet";

export default class ImpMalCharacterSheet extends ImpMalActorSheet
{

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat("character");
        options.height = 750;
        options.width = 550;
        options.dragDrop.push([{ dragSelector: ".actor-list .actor", dropSelector: null }]);
        return options;
    }

    _getHeaderButtons() 
    {
        let buttons = super._getHeaderButtons();
        if (this.actor.isOwner) 
        {
            buttons = [
                {
                    label: "",
                    class: "advancement",
                    icon: "fa-solid fa-chevrons-up",
                    onclick: () => 
                    {
                        new AdvancementForm(this.actor).render(true);
                    }
                }
            ].concat(buttons);
        }
        return buttons;
    }

    async _onDrop(ev)
    {
        let dropData = JSON.parse(ev.dataTransfer.getData("text/plain"));
        if (dropData.type == "Actor")
        {
            let actor = await Actor.fromDropData(dropData);
            if (actor.type == "patron")
            {
                this.object.update({"system.patron.id" : actor.id});
            }
        }
        else 
        {
            super._onDrop(ev);
        }

    }


    activateListeners(html) 
    {
        super.activateListeners(html);

        html.find(".equip").click(ev => 
        {
            let itemId = $(ev.currentTarget).parents(".list-item").attr("data-id");
            let hand = ev.currentTarget.dataset.hand;
            let item = this.actor.items.get(itemId);

            this.actor.update(this.actor.system.hands.toggle(item, hand));
            
        });

        html.find(".patron").on("dragenter", (ev => 
        {
            if (!this.object.system.patron.document)
            {
                ev.currentTarget.classList.add("hover");
            }
        }));

        
        html.find(".patron").on("dragleave", (ev => 
        {
            ev.currentTarget.classList.remove("hover");
        }));

        html.find(".patron").click(() => 
        {
            if (this.object.system.patron.document)
            {
                this.object.system.patron.document.sheet.render(true);
            }
            else 
            {
                ui.notifications.notify("IMPMAL.AddPatron");
            }
        });
    }
}