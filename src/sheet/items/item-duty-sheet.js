import BackgroundItemSheet from "./item-background-sheet";


export default class DutyItemSheet extends BackgroundItemSheet
{
    async getData()
    {
        let data = await super.getData();
        return data;
    }

    _onDropItemBoonLiability(ev, item)
    {
        this.item.update(this.item.system.patron.boon.set(item));
    }

    _onDropItemFaction(ev, item)
    {
        this.item.update(this.item.system.faction.set(item));
    }

    _onDropTable(ev, table)
    {
        let path = this._getPath(ev);
        if (path && (ev.target.classList.contains("table-drop") || $(ev.target).parents(".table-drop").length))
        {
            this.item.update(getProperty(this.item, path).set(table));
        }
        else 
        {
            ui.notifications.error(game.i18n.localize("IMPMAL.ErrorDutyTableDrop"));
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
            this.item.update(this.item.system.talents.removeId(id));
        }
    }
}