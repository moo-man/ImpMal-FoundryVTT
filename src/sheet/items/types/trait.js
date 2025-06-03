import IMItemSheet from "../item.js";

export default class TraitSheet extends IMItemSheet
{
    static type="trait"

    static DEFAULT_OPTIONS = {
      classes: [this.type],
    }
    
    static PARTS = {
      header : {scrollable: [""], template : 'systems/impmal/templates/item/item-header.hbs', classes: ["sheet-header"] },
      tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
      description: { scrollable: [""], template: 'systems/impmal/templates/item/item-description.hbs' },
      details: { scrollable: [""], template: `systems/impmal/templates/item/types/${this.type}.hbs` },
      effects: { scrollable: [""], template: 'systems/impmal/templates/item/item-effects.hbs' },
    }

    async _prepareContext(options)
    {
      let context = await super._prepareContext(options);
      context.attackTypes = {
        melee :  "IMPMAL.Melee",
        ranged :  "IMPMAL.Ranged"
       }
      return context;
    }
}