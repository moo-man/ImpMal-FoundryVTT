import { BuyAmmoForm } from "../../apps/buy-ammo";
import ImpMalItemSheet from "./item-sheet";

export default class WeaponItemSheet extends ImpMalItemSheet
{

    async getData() 
    {
        let data = await super.getData();
        data.modificationEffects = this.item.system.mods.documents.reduce((prev, current) => prev.concat(current.effects.contents), []);
        data.effectsFromActor = this.item.actor?.getEffectsApplyingToItem(this.item);
        return data;
    }


    _onDropItemModification(ev, item)
    {
        this.item.update(this.item.system.mods.add(item.toObject()));
    }

    activateListeners(html) 
    {
        super.activateListeners(html);

        html.find(".mod-delete").click(ev => 
        {
            let index = Number(this._getIndex(ev));
            if (Number.isInteger(index))
            {
                this.item.update(this.item.system.mods.remove(index));
            }
        });

        html.find(".mod-sheet").click(ev => 
        {
            let index = Number(this._getIndex(ev));
            let document = this.item.system.mods.documents[index];
            if (document)
            {
                document.sheet.render(true, {editable : false});
            }
        });

        html.find(".mod-toggle").click(ev => 
        {
            let index = Number(this._getIndex(ev));
            let modList = foundry.utils.deepClone(this.item.system.mods.list);
            modList[index].system.disabled = !modList[index].system.disabled;
            this.item.update({"system.mods.list" : modList});
        });

        html.find(".buy-ammo").click(() => 
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
        });
    }
}