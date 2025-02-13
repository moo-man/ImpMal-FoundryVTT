import { EquipSlots } from "./components/equip-slots";
import { EquippableItemModel } from "./components/equippable";
let fields = foundry.data.fields;

export class AugmeticModel extends EquippableItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.slots = new fields.EmbeddedDataField(EquipSlots);
        return schema;
    }

    async _preUpdate(data, options, user)
    {
        if (foundry.utils.hasProperty(options.changed, "system.slots.value"))
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

}