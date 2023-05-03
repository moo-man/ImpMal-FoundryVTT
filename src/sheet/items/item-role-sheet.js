import BackgroundItemSheet from "./item-background-sheet";


export default class RoleItemSheet extends BackgroundItemSheet
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
            if (item.type == "talent")
            {
                this.item.update({"system.talents.list" : this.item.system.talents.add({id : item.id})});
            }
            else 
            {
                super._onDrop(ev);
            }
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
        let item = this.item.system.talents.documents.find(i => i.id == id);
        item.sheet?.render(true, {editable : false});
    }

    _onListDelete(ev)
    {
        ev.stopPropagation();
        let id = this._getId(ev);
        if (id)
        {
            this.item.update({"system.talents.list" : this.item.system.talents.removeId(id)});
        }
    }
}