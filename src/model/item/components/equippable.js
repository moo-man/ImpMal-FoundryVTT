import { PhysicalItemModel } from "./physical";

let fields = foundry.data.fields;

export class EquippableItemModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.equipped = new fields.SchemaField({
            value : new fields.BooleanField(),
            force : new fields.BooleanField()
        });

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

    computeBase() 
    {
        super.computeBase();

        if (this.equipped.force)
        {
            this.equipped.value = true;
        }

        // A slotted item is equipped if the parent item is not equippable or if it is equippable, if it's equipped
        if (this.isSlotted && (!(this.isSlotted?.system?.equippable) || this.isSlotted?.system?.isEquipped))
        {
            this.equipped.value = true;
        }
        
        // if equipped/worn, reduce encumbrance by 1
        if (this.equipped.value)
        {
            this.encumbrance.total = Math.max(0, this.encumbrance.total - 1);
        }
    }
    get isEquipped() 
    {
        return this.equipped.value;
    }

    get equippable()
    {
        return true;
    }

    shouldTransferEffect(effect)
    {
        // effect.equipTransfer means to check the item equip state and only transfer the effect if true. If equipTransfer is false, always transfer the effect
        return super.shouldTransferEffect(effect) && (!effect.system.transferData.equipTransfer || (effect.system.transferData.equipTransfer && this.isEquipped));
    }
}