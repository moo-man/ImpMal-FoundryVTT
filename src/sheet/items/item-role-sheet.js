import BackgroundItemSheet from "./item-background-sheet";


export default class RoleItemSheet extends BackgroundItemSheet
{

    async getData()
    {
        let data = await super.getData();
        await data.item.system.specialisations.awaitDocuments();
        await data.item.system.talents.awaitDocuments();
        return data;
    }

    _onDropItemTalent(ev, item)
    {
        return this.item.update({"system.talents.list" : this.item.system.talents.add({id : item.id})});
    }

    _onDropItemSpecialisation(ev, item)
    {
        return this.item.update({"system.specialisations.list" : this.item.system.specialisations.add({id : item.id})});
    }

    _onListEdit(ev)
    {
        ev.stopPropagation();
        let id = this._getId(ev);
        let collection = this._getCollection(ev);
        if (collection == "effects")
        {
            return super._onListEdit(ev);
        }
        let item = this.item.system.talents.documents.find(i => i.id == id);
        item.sheet?.render(true, {editable : false});
    }

    _onListDelete(ev)
    {
        ev.stopPropagation();
        let id = this._getId(ev);
        let collection = this._getCollection(ev);
        if (collection == "effects")
        {
            return super._onListDelete(ev);
        }
        let path = this._getPath(ev);
        if (id)
        {
            this.item.update({[`${path}.list`] : getProperty(this.item, path).removeId(id)});
        }
    }
}