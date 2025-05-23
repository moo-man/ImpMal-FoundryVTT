import BackgroundSheet from "./background.js";

export default class OriginSheet extends BackgroundSheet
{
    static type="origin"

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
      context.equipment = await this.item.system.equipment.awaitDocuments();
      context.talents = await this.item.system.talents.awaitDocuments();
      return context;
    }

    async _onDropItem(data, ev)
    {
        let item = await Item.implementation.fromDropData(data);

        if (item.system.isPhysical)
        {
            return this.item.update(this.item.system.equipment.add(item));
        }
        else if (item.type == "talent")
        {
            return this.item.update(this.item.system.talents.add(item));
        }
    }

    async _onDropRollTable(data, ev)
    {
        let table = await RollTable.implementation.fromDropData(data);
        this.item.update(this.item.system.factionTable.set(table));
    }
}