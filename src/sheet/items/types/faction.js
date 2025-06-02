import BackgroundSheet from "./background.js";

export default class FactionSheet extends BackgroundSheet
{
    static type="faction"

    static DEFAULT_OPTIONS = {
      classes: [this.type],
      defaultTab : "details-character",

      position : {
        width: 700,
        height: 500,
      },
    }
    
    static PARTS = {
      header : {scrollable: [""], template : 'systems/impmal/templates/item/item-header.hbs', classes: ["sheet-header"] },
      tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
      "notes-patron": { scrollable: [""], template: 'systems/impmal/templates/item/patron-description.hbs' },
      "details-patron": { scrollable: [""], template: `systems/impmal/templates/item/types/${this.type}-patron.hbs` },
      "notes-character": { scrollable: [""], template: 'systems/impmal/templates/item/character-description.hbs' },
      "details-character": { scrollable: [""], template: `systems/impmal/templates/item/types/${this.type}-character.hbs` },
    }

    static TABS = {
      "notes-patron": {
        id : "notes-patron",
        group : "primary",
        label : "IMPMAL.DescriptionPatron"
      },
      "details-patron": {
        id : "details-patron",
        group : "primary",
        label : "IMPMAL.DetailsPatron"
      },
      "notes-character": {
        id : "notes-character",
        group : "primary",
        label : "IMPMAL.DescriptionCharacter"
      },
      "details-character": {
        id : "details-character",
        group : "primary",
        label : "IMPMAL.DetailsCharacter"
      }
    }

    _prepareTabs(options) 
    {
        let tabs = super._prepareTabs(options);
        if (!game.user.isGM)
        {
          delete tabs["notes-patron"];
          delete tabs["details-patron"];
          tabs["notes-character"].label = "IMPMAL.Description";
          tabs["details-character"].label = "IMPMAL.Details";
        }
        return tabs;
    }

    async _onDropItem(data, ev)
    {
      let item = await Item.implementation.fromDropData(data);
      if (item.type == "duty")
      {
        if (item.system.category == "patron")
        {
          this.document.update(this.document.system.patron.duty.add(item));
        }
        else if (item.system.category == "character")
        {
          this.document.update(this.document.system.character.duty.add(item));
        }
      }
    }
}