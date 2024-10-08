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
        let path = this.schema.fieldPath
        item = item || this[hand].document;
        let uuid = item?.uuid;

        // Other hand
        let other = hand == "left" ? "right" : "left";        
        let update = {};

        if(item?.system.isEquipped) // If currently equipped, clear from hand fields
        {
            for(let hand in this)
            {
                if(this[hand].uuid == uuid)
                {
                    update[`${path}.${hand}.uuid`] = "";
                }
            }
        }

        else if (item) // If not currently equipped, add UUID to hand fields
        {

            if (this[hand].useless)
            {
                let error = game.i18n.localize("IMPMAL.ErrorHandUnusable");
                ui.notifications.error(error);
                throw new Error(error);
            }

            if (item.system.traits.has("twohanded"))
            {
                update[`${path}.left.uuid`] = uuid;
                update[`${path}.right.uuid`] = uuid;
            }
            else 
            {
                update[`${path}.${hand}.uuid`] = uuid;
                // If other hand is holding a two handed weapon, unequip it
                if (this[hand].document?.system.traits.has("twohanded"))
                {
                    update[`${path}.${other}.uuid`] = "";   
                }
            }
        }

        return update;
    }

    isHolding(uuid)
    {
        let hands = {};
        for(let hand in this)
        {
            if (this[hand].uuid == uuid)
            {
                hands[hand] = true;
            }
        }
        return hands;
    }
}