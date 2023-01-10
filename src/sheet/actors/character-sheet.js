import ImpMalActorSheet from "./actor-sheet";

export default class ImpMalCharacterSheet extends ImpMalActorSheet
{

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat("character");
        return options;
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