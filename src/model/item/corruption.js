import { EquipSlots } from "./components/equip-slots";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class CorruptionModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.slots = new fields.EmbeddedDataField(EquipSlots);
        schema.category = new fields.StringField();
        return schema;
    }

    _addModelProperties()
    {
        if (this.parent.actor)
        {
            this.slots.relative = this.parent.actor.items;
            this.slots.list.forEach(i => i.relative = this.slots.relative);
        }
    }

    async summaryData()
    {
        let data = await super.summaryData();
        data.tags.push(game.impmal.config.corruptionType[this.category]);
        return data;
    }

}