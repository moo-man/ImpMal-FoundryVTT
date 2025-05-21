import IMItemSheet from "../item-sheet-v2.js";

export default class PowerSheet extends IMItemSheet
{
    static type="power"

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
      context.difficulties = foundry.utils.deepClone(game.impmal.config.difficulties);
      for(let d in context.difficulties)
      {
        let difficulty = context.difficulties[d];
        difficulty.name = `${difficulty.name} (${foundry.applications.handlebars.numberFormat(difficulty.modifier, {hash : {sign: true}}).string})`
      }
      return context;
    }
}