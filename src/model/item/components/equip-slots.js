let fields = foundry.data.fields;

export class EquipSlots extends DocumentReferenceListModel 
{
    // listSchema = new fields.SchemaField({
    //     id : new fields.StringField({}),
    //     name : new fields.StringField({}),
    //     source : new fields.StringField({})
    // }); 

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.value = new fields.NumberField({initial: 0});
        return schema;
    }

        
    updateSlotsValue(newValue)
    {
        if (newValue < this.list.length)
        {
            return this.list.slice(0, newValue);
        }
        else if (newValue > this.list.length)
        {
            return this.list.concat(Array(newValue - this.list.length).fill({id : null}))
        }
        else 
        {
            return this.list
        }
    }

    slotItem(item, slot)
    {
        let parent = this.parent.parent.actor;
        if (!parent || item.actor?.id != parent?.id)
        {
            ui.notifications.error("IMPMAL.ErrorSlotItemActor", {localize : true})
            return {};
        }

        if (slot >= this.list.length)
        {
            return {}
        }

        let list = foundry.utils.deepClone(this.list);
        list[slot] = {id : item.id, name: item.name};
        return {[this.schema.fieldPath + ".list"] : list};

    }
}

