import BuyAmmoForm from "../../../apps/buy-ammo.js";
import IMItemSheet from "../item.js";

export default class WeaponSheet extends IMItemSheet
{
    static type="weapon"

    static DEFAULT_OPTIONS = {
      classes: [this.type],
      actions : {
        buyAmmo : this._onBuyAmmo,
        openMod : this._onOpenMod,
        toggleMod : this._onToggleMod
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
      context.attackTypes = {
       melee :  "IMPMAL.Melee",
       ranged :  "IMPMAL.Ranged"
      }
      return context;
    }

    async _onDropItem(data, ev)
    {
        let document = await Item.fromDropData(data);
        if (document.type == "modification" && document.system.type == "weapon")
        {
          this.item.update(this.item.system.mods.add(document.toObject()));
        }
        else super._onDropItem(data, ev);
    }

    static _onBuyAmmo(ev, target)
    {
      if (this.item.isOwned)
        {
            new BuyAmmoForm(this.item).render(true);
        }
        else 
        {
            Item.create({name : this.item.name  + " Ammo", type : "ammo", "system.quantity" : this.item.system.mag.value, "system.cost" : this.item.system.ammoCost}).then(item => 
            {
                ui.notifications.notify(`Created ${item.name}`);
            });
        }
    }

    static _onOpenMod(ev, target)
    {
      let index = this._getIndex(ev);
      this.document.system.mods.documents[index].sheet.render({force: true, editable: false})
    }

    static _onToggleMod(ev, target)
    {
      let index = this._getIndex(ev);
      this.item.update(this.item.system.mods.edit(index, {"system.disabled" : !this.item.system.mods.documents[index].system.disabled}));
    }
    
}