import BackgroundSheet from "./background.js";

export default class RoleSheet extends BackgroundSheet
{
    static type="role"

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
      context.specialisations = await this.item.system.specialisations.awaitDocuments();
      context.talents = await this.item.system.talents.awaitDocuments();
      return context;
    }


    async _onDropItem(data, ev)
    {
        let item = await Item.implementation.fromDropData(data);

        if (item.type == "talent")
        {
            return this.item.update(this.item.system.talents.add(item));
        }
        else if (item.type == "specialisation")
        {
            return this.item.update(this.item.system.specialisations.add(item));
        }
    }
}