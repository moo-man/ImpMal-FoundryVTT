import IMItemSheet from "../item-sheet-v2.js";

export default class ProtectionSheet extends IMItemSheet
{
    static type="protection"

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
}