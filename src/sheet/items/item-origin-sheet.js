import BackgroundItemSheet from "./item-background-sheet";


export default class OriginItemSheet extends BackgroundItemSheet
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
            this.item.update({"system.equipment.list" : this.item.system.equipment.add({id : item.id})});
        }
        else 
        {
            super._onDrop(ev);
        }

    }


    _onListEdit(ev)
    {
        ev.stopPropagation();
        let id = this._getId(ev);
        let item = this.item.system.equipment.documents.find(i => i.id == id);
        item.sheet?.render(true, {editable : false});
    }

    _onListDelete(ev)
    {
        ev.stopPropagation();
        let id = this._getId(ev);
        if (id)
        {
            this.item.update({"system.equipment.list" : this.item.system.equipment.removeId(id)});
        }
    }
}