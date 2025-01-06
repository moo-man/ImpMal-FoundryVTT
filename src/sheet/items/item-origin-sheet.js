import BackgroundItemSheet from "./item-background-sheet";


export default class OriginItemSheet extends BackgroundItemSheet
{
    async getData()
    {
        let data = await super.getData();
        data.equipment = await data.item.system.equipment.awaitDocuments();
        return data;
    }


    _onDropItem(ev, item)
    {
        return this.item.update(this.item.system.equipment.add({uuid : item.uuid}));
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

        let document = (await this.item.system.equipment.awaitDocuments())[index];
        
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
        if (Number.isNumeric(index))
        {
            this.item.update(this.item.system.equipment.remove(index));
        }
    }
}