import IMItemSheet from "../item.js";

export default class TalentSheet extends IMItemSheet
{
    static type="talent"

    static DEFAULT_OPTIONS = {
      classes: [this.type],
      actions : {
        configureEffectOptions: this._onConfigureEffectOptions
      }
    }
    
    static PARTS = {
      header : {scrollable: [""], template : 'systems/impmal/templates/item/item-header.hbs', classes: ["sheet-header"] },
      tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
      description: { scrollable: [""], template: 'systems/impmal/templates/item/item-description.hbs' },
      details: { scrollable: [""], template: `systems/impmal/templates/item/types/${this.type}.hbs` },
      effects: { scrollable: [""], template: 'systems/impmal/templates/item/item-effects.hbs' },
    }

    static async _onConfigureEffectOptions(ev, target)
    {
      if (this.item.isOwned)
        {
            ui.notifications.error(game.i18n.localize("IMPMAL.ErrorOwnedEffectOptions"));
            return;
        }

        let choices = await ItemDialog.create(this.item.effects, "unlimited", {title: this.document.name, text: "Select Active Effects to include"});
        this.item.update({
            system : {
                "effectOptions.list" : choices.map(i => {return {id : i.id};}),
                effectChoices : {},
                effectTakenRequirement : choices.reduce((prev, current) => {prev[current.id] = 1; return prev;}, {}),
                effectRepeatable : {}
            }
        });
    }
}