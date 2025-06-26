import IMItemSheet from "../item.js";

export default class AmmoSheet extends IMItemSheet
{
    static type="ammo"

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

    async _onDropItem(data, ev)
    {
      let item = await Item.implementation.fromDropData(data);
      switch(item?.type)
      {
        case "ammo":
          this.document.system.applyCustomAmmo(item);
          break;
      }
    }

}