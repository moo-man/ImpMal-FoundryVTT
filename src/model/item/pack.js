import { PhysicalItemModel } from "./components/physical";
let fields = foundry.data.fields;


export class PackModel extends PhysicalItemModel
{
    static LOCALIZATION_PREFIXES = ["WH.Models.pack"];
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.ignoreEncumbrance = new fields.BooleanField();
        schema.items = new fields.EmbeddedDataField(DiffReferenceListModel);
        schema.actorItems = new fields.EmbeddedDataField(DocumentReferenceListModel);
        return schema;
    }


    async _preCreate(data, options, user)
    {
        await super._preCreate(data, options, user);

        if (this.parent.actor)
        {
            let items = await this.parent.actor.createEmbeddedDocuments("Item", (await this.items.documents).map(i => i.toObject()));
            this.updateSource({"actorItems.list" : items.map(i => {return {uuid : i.uuid, name : i.name}})});
        }
    }

    /**
     * Adds an item to the pack's list. If the pack is owned by the actor, also make sure that item is added to the actor if it wasn't already, also unequip it.
     * If the pack is not owned by the actor, ensure that the item added is not owned
     *  
     * @param {Item} item Item to be added to the pack
     * @returns 
     */
    async addItem(item)
    {
        if (item.system.isPhysical && item.type != "pack")
        {
            if(this.parent.isOwned)
            {
                // If item is not owned by the actor, add it first
                if (item.actor?.uuid != this.parent.actor.uuid)
                {
                    item = (await this.parent.actor.createEmbeddedDocuments("Item", [item.toObject()]))[0];
                }
                
                await item.system.unequip?.()
                return this.parent.update(this.actorItems.add(item));
            }
            else
            {
                if (item.isOwned)
                {
                    return ui.notifications.error("IMPMAL.ErrorOwnedItemInPack", {localize : true})
                }
                else 
                {
                    return this.parent.update(this.items.add(item));
                }
            }
        }
                
    }
}