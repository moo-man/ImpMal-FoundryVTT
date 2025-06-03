import ItemTraitsForm from "../../apps/item-traits";
import SheetMixin from "../mixin";


export default class IMItemSheet extends SheetMixin(WarhammerItemSheetV2)
{
    static type=""

    static hasConditionEffects = false
  
    static DEFAULT_OPTIONS = {
      classes: ["impmal"],
      defaultTab : "description",
      position : {
        width: 500,
        height: 700,
      },
      window : {
        controls : [
          {
            icon : 'fa-solid fa-comment',
            label : "Post to Chat",
            action : "postToChat"
          },
          {
            icon : 'fa-solid fa-shop',
            label : "Roll Availability",
            action : "rollAvailability",
            condition: (...args) => {console.log("TEST", args)}
          },
        ]
      },
      actions : {
        postToChat : function() {this.item.postItem()},
        rollAvailability : this._onRollAvailability,
        editTraits : this._onEditTraits,
        editDiff : this._onEditDiff,
        
      }
    }

    static TABS = {
        description: {
          id: "description",
          group: "primary",
          label: "Description",
        },
        details: {
          id: "details",
          group: "primary",
          label: "Details",
        },
        effects: {
          id: "effects",
          group: "primary",
          label: "Effects",
        }
      }

    _getContextMenuOptions()
  { 
    let getParent = this._getParent.bind(this);
    return [
      {
        name: "Edit",
        icon: '<i class="fas fa-edit"></i>',
        condition: li => !!li.dataset.uuid || getParent(li, "[data-uuid]"),
        callback: async li => {
          let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
          const document = await fromUuid(uuid);
          document.sheet.render(true);
        }
      },
      {
        name: "Remove",
        icon: '<i class="fas fa-times"></i>',
        condition: li => !!li.dataset.uuid || getParent(li, "[data-uuid]"),
        callback: async li => 
        {
          let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
          const document = await fromUuid(uuid);
          document.delete();
        }
      },
      {
        name: "Duplicate",
        icon: '<i class="fa-solid fa-copy"></i>',
        condition: li => !!li.dataset.uuid || getParent(li, "[data-uuid]"),
        callback: async li => 
        {
            let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
            const document = await fromUuid(uuid);
            this.item.createEmbeddedDocuments("ActiveEffect", [document.toObject()]);
        }
      },
    ];
  }
    

    async _onDropItem(data, ev)
    {
        let document = await Item.fromDropData(data);
        let slot = ev.target.closest(".slot")

        // If dropped into a sustained power section, or a slot. 
        // Only applies to items already owned by the actor
        if (slot && document.actor?.uuid == this.document.actor.uuid)
        {
            if (slot && document.system.isPhysical)
            {
                let index = slot.dataset.index;
                let dropItem = this.document.actor.items.get(ev.target.closest(".list-row")?.dataset.id);
                dropItem?.update(dropItem.system.slots.slotItem(document, index));
            }
            else 
            {
                super._onDropItem(data, ev);
            }
        }
        else 
        {
            super._onDropItem(data, ev);
        }
    }


    static _onRollAvailability(ev, target)
    {
        this.item.system.setupAvailabilityTest();
    }

    async _prepareContext(options) 
    {
        let data = await super._prepareContext(options);
        data.conditions = this.formatConditions(data);
        return data;
    }


    async _handleEnrichment() 
    {
        return foundry.utils.expandObject({
            "system.notes.player" : await TextEditor.enrichHTML(this.item.system.notes?.player, {secrets : this.item.isOwner, relativeTo: this.item, async: true}),
            "system.notes.gm" : await TextEditor.enrichHTML(this.item.system.notes?.gm, {secrets : this.item.isOwner, relativeTo: this.item, async: true}),
            "system.patron.notes" : await TextEditor.enrichHTML(this.item.system.patron?.notes, {secrets : this.item.isOwner, relativeTo: this.item, async: true}),
            "system.character.notes" : await TextEditor.enrichHTML(this.item.system.character?.notes, {secrets : this.item.isOwner, relativeTo: this.item, async: true})
        });
    }


    static _onEditTraits(ev, target) 
    {
        let path = target.dataset.path;
        new ItemTraitsForm(this.item, {path}).render(true);
    }
    
    static async _onEditDiff(ev, target)
    {
        let list = this._getList(ev, target);
        let index = this._getIndex(ev, target);

        let listObj = list.list[index].toObject();
        let document = await list.list[index].document;

        let newDiff = await WarhammerDiffEditor.wait(listObj.diff, {document : document.originalDocument});
        listObj.diff = newDiff;
        if (listObj.name)
        {
            listObj.name = newDiff.name;
        }
        else 
        {
            listObj.name = document.originalDocument.name;
        }
        this.item.update(list.edit(index, listObj));
    }
}