import { EquipSlots } from "./components/equip-slots";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class CorruptionModel extends StandardItemModel 
{
    static LOCALIZATION_PREFIXES = ["WH.Models.corruption"];

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.slots = new fields.EmbeddedDataField(EquipSlots);
        schema.category = new fields.StringField();
        return schema;
    }

    async _preUpdate(data, options, user)
    {
        await super._preUpdate(data, options, user);
        if (foundry.utils.hasProperty(options.changed, "system.slots.value") && !foundry.utils.hasProperty(options.changed, "system.slots.list"))
        {
            data.system.slots.list = this.slots.updateSlotsValue(foundry.utils.getProperty(options.changed, "system.slots.value"))
        }
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