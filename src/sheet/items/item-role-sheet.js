import BackgroundItemSheet from "./item-background-sheet";


export default class RoleItemSheet extends BackgroundItemSheet
{
    _onDropItemTalent(ev, item)
    {
        return this.item.update({"system.talents.list" : this.item.system.talents.add({id : item.id})});
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