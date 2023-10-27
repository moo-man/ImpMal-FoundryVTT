import ImpMalItemSheet from "./item-sheet";


export default class AmmoItemSheet extends ImpMalItemSheet 
{
    // Handle applying Custom ammunition to basic Ammunition. 
    _onDropItemAmmo(ev, appliedAmmo) 
    {
        // Abort if this ammo is also custom, or if the applied ammo is not custom
        if (this.item.system.custom || !appliedAmmo.system.custom) 
        {
            return ui.notifications.error(game.i18n.localize("IMPMAL.ErrorApplyCustomAmmo"));
        }

        

        return this.item.update({
            name: this.item.name += ` (${appliedAmmo.name})`,
            system : {
                cost : appliedAmmo.system.priceMultiplier * this.item.system.cost,
                availability : appliedAmmo.system.availability,
                addedTraits : appliedAmmo.system.addedTraits,
                removedTraits : appliedAmmo.system.removedTraits,
                usedWith : appliedAmmo.system.usedWith,
                damage : appliedAmmo.system.damage
            }
        }).then(item => item.createEmbeddedDocuments("ActiveEffect", appliedAmmo.effects.contents));
    }
}