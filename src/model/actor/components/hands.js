import { DocumentReferenceModel } from "../../shared/reference";

let fields = foundry.data.fields;

export class HandsModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.left = new fields.EmbeddedDataField(DocumentReferenceModel);
        schema.right = new fields.EmbeddedDataField(DocumentReferenceModel);
        return schema;
    }


    getDocuments(collection) 
    {
        for(let hand in this)
        {
            this[hand].getDocument(collection);
        }
    }

    toggle(item, hand)
    {
        let id = item.id;

        if(item.system.isEquipped) // If equipped, clear from hand fields
        {
            let update = {};
            for(let hand in this)
            {
                if(this[hand].id == id)
                {
                    update[`system.hands.${hand}.id`] = "";
                }
            }
            return update;
        }
        
        else // If not equipped, add IDs to hand fields
        {
            if (item.system.traits.has("twohanded"))
            {
                return {[`system.hands.left.id`] : id, [`system.hands.right.id`] : id} ;
            }
            else 
            {
                return {[`system.hands.${hand}.id`] : id};
            }
        }
    }

    isHolding(id)
    {
        let hands = {};
        for(let hand in this)
        {
            if (this[hand].id == id)
            {
                hands[hand] = true;
            }
        }
        return hands;
    }
}