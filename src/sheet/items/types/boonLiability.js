import IMItemSheet from "../item-sheet-v2.js";

export default class BoonLiabilitySheet extends IMItemSheet
{
    static type="boonLiability"

    static DEFAULT_OPTIONS = {
      classes: [this.type],
    }
    
    static PARTS = {
      header : {scrollable: [""], template : 'systems/impmal/templates/item/v2/item-header.hbs', classes: ["sheet-header"] },
      tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
      description: { scrollable: [""], template: 'systems/impmal/templates/item/v2/item-description.hbs' },
      details: { scrollable: [""], template: `systems/impmal/templates/item/v2/types/${this.type}.hbs` },
      effects: { scrollable: [""], template: 'systems/impmal/templates/item/v2/item-effects.hbs' },
    }

    async _prepareContext(options)
    {
      let context = await super._prepareContext(options);
      context.categories = {
        boon : "IMPMAL.Boon",
        liability : "IMPMAL.Liability"
      }
      return context;
    }
}