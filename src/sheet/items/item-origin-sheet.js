import BackgroundItemSheet from "./item-background-sheet";


export default class OriginItemSheet extends BackgroundItemSheet
{
    async getData()
    {
        let data = await super.getData();
        data.equipment = await data.item.system.equipment.awaitDocuments();
        data.talents = await data.item.system.talents.awaitDocuments();
        return data;
    }


    _onDropItem(ev, item)
    {
        if (item.system.isPhysical)
        {
            return this.item.update(this.item.system.equipment.add(item));
        }
        else if (item.type == "talent")
        {
            return this.item.update(this.item.system.talents.add(item));
        }
    }

    _onDropTable(ev, table)
    {
        this.item.update(this.item.system.factionTable.set(table));
    }

    async _onListEdit(ev)
    {
        let index = this._getIndex(ev);
        let collection = this._getCollection(ev);
        if (collection == "effects")
        {
            return super._onListEdit(ev);
        }

        let list = this._getList(ev);

        let document = await list.list[index].document
            
        document?.sheet.render(true, {editable : false})
    }

    _onListDelete(ev)
    {
        let index = this._getIndex(ev);
        let collection = this._getCollection(ev);
        if (collection == "effects")
        {
            return super._onListDelete(ev);
        }
        let list = this._getList(ev);
        if (Number.isNumeric(index))
        {
            this.item.update(list.remove(index));
        }
    }
}