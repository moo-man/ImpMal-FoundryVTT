import ImpMalItemSheet from "./item-sheet";

export default class TalentItemSheet extends ImpMalItemSheet
{

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.width = 500;
        return options;
    }


    activateListeners(html) 
    {
        super.activateListeners(html);

        html.find(".effect-options").on("click", async () => 
        {
            if (this.item.isOwned)
            {
                ui.notifications.error(game.i18n.localize("IMPMAL.ErrorOwnedEffectOptions"));
                return;
            }

            let choices = await ItemDialog.create(this.item.effects, "unlimited");
            this.item.update({
                system : {
                    "effectOptions.list" : choices.map(i => {return {id : i.id};}),
                    effectChoices : {},
                    effectTakenRequirement : choices.reduce((prev, current) => {prev[current.id] = 1; return prev;}, {}),
                    effectRepeatable : {}
                }
            });
        });

        html.find(".taken-req").on("change", ev => 
        {
            let id = this._getId(ev);
            let value = Math.max(1, Number(ev.target.value));
            ev.target.value = value; // If Math.max bounded the value, update the UI
            this.item.update({["system.effectTakenRequirement." + id] : value});
        });

        html.find(".repeat").on("change", ev => 
        {
            let id = this._getId(ev);
            this.item.update({["system.effectRepeatable." + id] : ev.target.checked});
        });
    }
}