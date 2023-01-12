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

        // Other hand
        let other = hand == "left" ? "right" : "left";        
        let update = {};

        if(item.system.isEquipped) // If currently equipped, clear from hand fields
        {
            for(let hand in this)
            {
                if(this[hand].id == id)
                {
                    update[`system.hands.${hand}.id`] = "";
                }
            }
        }
        
        else // If not currently equipped, add IDs to hand fields
        {
            if (item.system.traits.has("twohanded"))
            {
                update[`system.hands.left.id`] = id;
                update[`system.hands.right.id`] = id;
            }
            else 
            {
                update[`system.hands.${hand}.id`] = id;
                // If other hand is holding a two handed weapon, unequip it
                if (this[hand].document?.system.traits.has("twohanded"))
                {
                    update[`system.hands.${other}.id`] = "";   
                }
            }
        }

        return update;

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