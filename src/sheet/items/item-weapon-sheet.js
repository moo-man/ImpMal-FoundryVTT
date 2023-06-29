import { BuyAmmoForm } from "../../apps/buy-ammo";
import ImpMalItemSheet from "./item-sheet";

export default class WeaponItemSheet extends ImpMalItemSheet
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.dragDrop.push([{ dragSelector: ".item-list .item", dropSelector: null }]);
        return options;
    }

    async _onDrop(ev)
    {
        let dropData = JSON.parse(ev.dataTransfer.getData("text/plain"));
        if (dropData.type == "Item")
        {
            let item = await Item.implementation.fromDropData(dropData);
            if (item.type == "modification")
            {
                this.item.update({"system.mods.list" : this.item.system.mods.add(item.toObject())});
            }
        }
        else 
        {
            super._onDrop(ev);
        }

    }

    activateListeners(html) 
    {
        super.activateListeners(html);

        html.find(".mod-delete").click(ev => 
        {
            let index = Number(this._getIndex(ev));
            if (Number.isInteger(index))
            {
                this.item.update({"system.mods.list" : this.item.system.mods.remove(index)});
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