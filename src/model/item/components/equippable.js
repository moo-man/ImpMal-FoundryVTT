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
}