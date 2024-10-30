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
        return this.item.update(this.item.system.talents.add({uuid : item.uuid}));
    }

    _onDropItemSpecialisation(ev, item)
    {
        return this.item.update(this.item.system.specialisations.add({uuid : item.uuid}));
    }

    async _onListEdit(ev)
    {
        let index = this._getIndex(ev);
        let collection = this._getCollection(ev);
        if (collection == "effects")
        {
            return super._onListEdit(ev);
        }
        let document = await this.item.system.talents.documents[index];
        if (document)
        {
            document.sheet.render(true, {editable : false});
        }
    }
    _onListDelete(ev)
    {
        ev.stopPropagation();
        let index = this._getIndex(ev);
        let collection = this._getCollection(ev);
        if (collection == "effects")
        {
            return super._onListDelete(ev);
        }
        let path = this._getPath(ev);
        if (Number.isNumeric(index))
        {
            this.item.update(foundry.utils.getProperty(this.item, path).remove(index));
        }
    }
}