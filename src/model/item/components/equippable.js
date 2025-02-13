import { PhysicalItemModel } from "./physical";

let fields = foundry.data.fields;

export class EquippableItemModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.equipped = new fields.SchemaField({
            value : new fields.BooleanField(),
        });

        return schema;
    }

    
    computeBase() 
    {
        super.computeBase();

        if (this.isSlotted?.system?.isEquipped)
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

    shouldTransferEffect(effect)
    {
        // effect.equipTransfer means to check the item equip state and only transfer the effect if true. If equipTransfer is false, always transfer the effect
        return super.shouldTransferEffect(effect) && (!effect.system.transferData.equipTransfer || (effect.system.transferData.equipTransfer && this.isEquipped));
    }
}