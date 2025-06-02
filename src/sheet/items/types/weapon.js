import BuyAmmoForm from "../../../apps/buy-ammo.js";
import IMItemSheet from "../item.js";

export default class WeaponSheet extends IMItemSheet
{
    static type="weapon"

    static DEFAULT_OPTIONS = {
      classes: [this.type],
      actions : {
        buyAmmo : this._onBuyAmmo
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
}