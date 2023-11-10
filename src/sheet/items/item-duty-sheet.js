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
        this.item.update({[`system.patron.boon`] : this.item.system.patron.boon.set(item)});
    }


    _onDropItemFaction(ev, item)
    {
        this.item.update({"system.faction" : this.item.system.faction.set(item)});
    }
    async _onDrop(ev)
    {
        let dropData = JSON.parse(ev.dataTransfer.getData("text/plain"));
        if (dropData.type == "RollTable")
        {
            let table = await RollTable.implementation.fromDropData(dropData);
            if (table)
            {
                if (ev.target.dataset.path)
                {
                    this.item.update({[ev.target.dataset.path] : getProperty(this.item, ev.target.dataset.path).set(table)});
                }
                else 
                {
                    ui.notifications.error(game.i18n.localize("IMPMAL.ErrorDutyTableDrop"));
                }
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