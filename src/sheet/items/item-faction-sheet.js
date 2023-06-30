import BackgroundItemSheet from "./item-background-sheet";


export default class FactionItemSheet extends BackgroundItemSheet
{
    _onDropItemDuty(item)
    {
        console.log(item);
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