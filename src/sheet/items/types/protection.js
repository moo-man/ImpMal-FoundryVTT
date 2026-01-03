import IMItemSheet from "../item.js";

export default class ProtectionSheet extends IMItemSheet
{
    static type="protection"

    static DEFAULT_OPTIONS = {
      classes: [this.type],
      actions : {
          toggleMod: this._onToggleMod,
          clearDamage: this._onClearDamage,
          clearRended: this._onClearRended
      }
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
        let document = await Item.fromDropData(data);
        if (document.type == "modification" && document.system.type == "protection")
        {
          this.item.update(this.item.system.mods.add(document.toObject()));
        }
        else super._onDropItem(data, ev);
    }
    
    static _onToggleMod(ev, target)
    {
      let index = this._getIndex(ev);
      this.item.update(this.item.system.mods.edit(index, {"system.disabled" : !this.item.system.mods.documents[index].system.disabled}));
    }

    static _onClearDamage(ev, target) {
        let damage = foundry.utils.deepClone(this.item.system.damage);
        if (damage) {
            for (let index in damage) {
                damage[index] = 0;
            }
            this.item.update({ "system.damage": damage });
        }
    }

    static _onClearRended(ev, target) {
        let rended = foundry.utils.deepClone(this.item.system.rended);
        if (rended) {
            for (let index in rended) {
                rended[index] = false;
            }
            this.item.update({ "system.rended": rended });
        }
    }
}