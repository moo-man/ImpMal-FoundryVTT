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
    }
}