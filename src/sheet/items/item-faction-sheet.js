import BackgroundItemSheet from "./item-background-sheet";


export default class FactionItemSheet extends BackgroundItemSheet
{
    _onDropItemDuty(ev, item)
    {
        this.item.update(this.item.system[item.system.category].duty.add(item));
    }

    async getData() 
    {
        let data = await super.getData();
        data.patronDutyString = (await Promise.all(this.item.system.patron.duty.documents)).map((doc, index) => `<a data-uuid=${doc.uuid} data-id=${doc.id} data-index=${index}>${doc.name}</a>`).join(", ");
        data.characterDutyString = (await Promise.all(this.item.system.character.duty.documents)).map((doc, index) => `<a data-uuid=${doc.uuid} data-id=${doc.id} data-index=${index}>${doc.name}</a>`).join(", ");
        return data;
    }
}