import BackgroundSheet from "./background.js";

export default class DutySheet extends BackgroundSheet
{
    static type="duty"

    static DEFAULT_OPTIONS = {
      classes: [this.type],
    }
    
    static PARTS = {
      header : {scrollable: [""], template : 'systems/impmal/templates/item/duty-header.hbs', classes: ["sheet-header"] },
      tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
      description: { scrollable: [""], template: 'systems/impmal/templates/item/duty-description.hbs' },
      details: { scrollable: [""], template: `systems/impmal/templates/item/types/${this.type}.hbs` },
    }

    
    static TABS = {
      description: {
        id: "description",
        group: "primary",
        label: "Description",
      },
      details: {
        id: "details",
        group: "primary",
        label: "Details",
      }
    }

    async _prepareContext(options)
    {
      let context = await super._prepareContext(options);
      context.categories = {
        character : "TYPES.Actor.character",
        patron : "TYPES.Actor.patron"
      }
      return context;
    }

    async _onDropItem(data, ev)
    {
      let item = await Item.implementation.fromDropData(data);
      let update;
      switch(item?.type)
      {
        case "faction":
          update = this.document.system.faction.set(item);
          break;
        case "boonLiability":
          update = this.document.system.patron.boon.set(item);
          break;
      }

      this.document.update(update);
    }

    async _onDropRollTable(data, ev)
    {
      let table = await RollTable.implementation.fromDropData(data);

      if (ev.target.closest(".boonTable"))
      {
        this.document.update(this.document.system.patron.boonTable.set(table));
      }
      else if (ev.target.closest(".liabilityTable"))
      {
        this.document.update(this.document.system.patron.liabilityTable.set(table));
      }

    }

}