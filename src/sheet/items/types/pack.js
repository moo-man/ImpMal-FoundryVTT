import IMItemSheet from "../item.js";

export default class PackSheet extends IMItemSheet
{
    static type="pack"

    static DEFAULT_OPTIONS = {
      classes: [this.type],
      actions: {
        openDocument : this._onOpenDocument,
        listDelet: this._onListDelete
      }
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
      if (this.document.isOwned)
      {
        context.items = await this.item.system.actorItems.awaitDocuments();
      }
      else
      {
        context.items = await this.item.system.items.awaitDocuments();
      }
      return context;
    }

    async _onDropItem(data, ev)
    {
        let item = await Item.implementation.fromDropData(data);
        this.document.system.addItem(item);
    }

    static async _onOpenDocument(ev, target)
    {
      if (this.document.isOwned)
      {
        let document = await this._getDocumentAsync(ev, target);
        document?.sheet.render({force: true})
      }
    }

    static async _onListDelete(ev, target)
    {
        let list = this.item.isOwned ? this.item.system.actorItems : this.item.system.items;
        let index = this._getIndex(ev);

        if (list)
        {
            doc.update(list.remove(index));
        }
    }
}