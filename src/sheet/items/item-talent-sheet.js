import DocumentChoice from "../../apps/document-choice";
import ImpMalItemSheet from "./item-sheet";

export default class TalentItemSheet extends ImpMalItemSheet
{
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

            let choices = await DocumentChoice.create(this.item.effects, "unlimited");
            this.item.update({
                system : {
                    "effectOptions.list" : choices.map(i => {return {id : i.id};}),
                    effectChoices : {},
                    effectTakenRequirement : choices.reduce((prev, current) => {prev[current.id] = 2; return prev;}, {})
                }
            });
        });

        html.find(".taken-req").on("change", ev => 
        {
            let id = this._getId(ev);
            let value = Math.max(2, Number(ev.target.value));
            ev.target.value = value; // If Math.max bounded the value, update the UI
            this.item.update({["system.effectTakenRequirement." + id] : value});
        });
    }
}