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


    // Convenience getters - injuries/criticals use hit locations: left/rightArm and check whether a weapon is being used 
    get leftArm() 
    {
        return this.left;
    }

    get rightArm()
    {
        return this.right;
    }

    toggle(hand, item) // Item necessary if equipping, if null, always unequip
    {
        item = item || this[hand].document;

        // Other hand
        let update = {};

        if(item?.system.isEquipped) // If currently equipped, clear from hand fields
        {
            update = this.unequip(item);
        }

        else if (item) // If not currently equipped, add UUID to hand fields
        {
            update = this.equip(item, hand);
        }

        return update;
    }

    equip(item, hand)
    {
        hand = hand || this.parent.handed;
        let other = hand == "left" ? "right" : "left";        
        let path = this.schema.fieldPath
        let id = item?.id;

        let update = {};
        if (this[hand].useless)
        {
            let error = game.i18n.localize("IMPMAL.ErrorHandUnusable");
            ui.notifications.error(error);
            throw new Error(error);
        }

        if (item.system.traits.has("twohanded"))
        {
            update[`${path}.left.id`] = id;
            update[`${path}.right.id`] = id;
            item.system.onEquipToggle(true);
        }
        else 
        {
            update[`${path}.${hand}.id`] = id;
            item.system.onEquipToggle(true);

            // If other hand is holding a two handed weapon, unequip it
            if (this[hand].document?.system.traits.has("twohanded"))
            {
                update[`${path}.${other}.id`] = "";   
            }
        }
        return update;
    }

    unequip(item)
    {
        let update = {};
        let path = this.schema.fieldPath
        let wasEquipped;
        for(let hand in this)
        {
            if (this[hand].id == item.id)
            {
                foundry.utils.mergeObject(update, this[hand].unset())
                wasEquipped = true;
            }    
        }
        if (wasEquipped)
        {
            item.system.onEquipToggle(false);
        }

        return {"system.hands" : update};
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