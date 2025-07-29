import { PhysicalItemModel } from "./components/physical";
let fields = foundry.data.fields;


export class PackModel extends PhysicalItemModel
{
    static LOCALIZATION_PREFIXES = ["WH.Models.pack"];
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.solars = new fields.NumberField({min: 0});
        schema.ignoreEncumbrance = new fields.BooleanField();
        schema.items = new fields.EmbeddedDataField(DiffReferenceListModel);
        schema.actorItems = new fields.EmbeddedDataField(DocumentReferenceListModel);
        schema.choices = new fields.EmbeddedDataField(ChoiceModel);

        return schema;
    }


    async _preCreate(data, options, user)
    {
        await super._preCreate(data, options, user);

        if (this.parent.actor)
        {
            let choiceItems = (await this.choices.promptDecision()).map(i => i.toObject())

            let itemData = (await Promise.all(this.items.documents)).map(i => i.toObject()).concat(choiceItems);

            let items = await this.parent.actor.createEmbeddedDocuments("Item", itemData);
            
            this.updateSource({"actorItems.list" : items.map(i => {return {uuid : i.uuid, name : i.name}})});
            if (this.solars)
            {
                await this.parent.actor.update({"system.solars" : this.parent.actor.system.solars + this.solars});
                ui.notifications.info("IMPMAL.SolarsAdded", {format : {solars : this.solars}});
                this.updateSource({"solars" : 0});
            }
        }
    }

    async _preDelete(options, user)
    {
        if (this.parent.isOwned && (await foundry.applications.api.Dialog.confirm({window: {title : "IMPMAL.DeletePackContents"}, content : game.i18n.localize("IMPMAL.DeletePackContentsPrompt")})))
        {
            this.parent.actor?.deleteEmbeddedDocuments("Item", this.actorItems.documents.map(i => i.id))
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