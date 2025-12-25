import ArmourConfig from "../../apps/armour-config";
import IMActorSheet from "./actor";

export default class VehicleSheet extends IMActorSheet
{

    factionsExpanded={}; // Retain expanded influence sections on rerender;

    static DEFAULT_OPTIONS = {
        classes: ["vehicle"],
        actions : {
          actorDelete : this._onActorDelete,
          showPassenger : this._onShowPassenger,
          createItem : this._onCreateItem,
          deleteEmbedded : this._onDeleteEmbeddedDoc,
          rollTest : this._onRollTest,
          useAction : this._onActionClick,
          toggleDriver : this._onToggleDriver,
          vehicleControl : this._onVehicleControl

        },
        defaultTab : "main"
      }

      static PARTS = {
        header : {scrollable: [""], classes : ["vehicle-header"], template : 'systems/impmal/templates/actor/vehicle/vehicle-header.hbs' },
        tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
        main: { scrollable: [""], template: 'systems/impmal/templates/actor/vehicle/vehicle-main.hbs' },
        cargo: { scrollable: [""], template: 'systems/impmal/templates/actor/vehicle/vehicle-cargo.hbs' },
        effects: { scrollable: [""], template: 'systems/impmal/templates/actor/tabs/actor-effects.hbs' },
        notes: { scrollable: [""], template: 'systems/impmal/templates/actor/vehicle/vehicle-notes.hbs' },
      }

      
      static TABS = {
        main: {
          id: "main",
          group: "primary",
          label: "IMPMAL.Main",
        },
        cargo: {
          id: "cargo",
          group: "primary",
          label: "IMPMAL.Cargo",
        },
        effects: {
          id: "effects",
          group: "primary",
          label: "IMPMAL.Effects",
        },
        notes: {
          id: "notes",
          group: "primary",
          label: "IMPMAL.Notes",
        }
      }

      async _prepareContext(options)
      {
        let context = await super._prepareContext(options)
        context.items.weapon = context.items.weapon.filter(w => !context.system.crew.weapons.has({id : w.id}) && !context.system.passengers.weapons.has({id : w.id}))
        context.driver = this.actor.system.driver;
        context.actions = Object.keys(game.impmal.config.vehicleActions).map(a => {
          let action = foundry.utils.deepClone(game.impmal.config.vehicleActions)[a];
          action.key = a;
          return action
        }).filter(action => {

          if (action.restriction)
            {
              return action.restriction(this.document)
            }
            else 
            {
              return true;
            }
        })
        return context;
      }

      async _handleEnrichment() 
      {
          let traitHTML = {};
          for(let t of this.actor.items.filter(i => i.type == "trait"))
          {
            let html = await foundry.applications.ux.TextEditor.enrichHTML(t.system.notes.player, {async: true, relativeTo: this.document, secrets : this.document.isOwner}) || `<p></p>`;
            if (game.user.isGM)
            {
                html += await foundry.applications.ux.TextEditor.enrichHTML(t.system.notes.gm, {async: true, relativeTo: this.document, secrets : this.document.isOwner});
            } 
            traitHTML[t.id] = html;
          }
          return foundry.utils.mergeObject(await super._handleEnrichment(), foundry.utils.expandObject({
            traits : traitHTML
          }));
      } 

      _onDragStart(ev)
      {
          let position = this._getDataAttribute(ev, "position");
          let uuid = this._getUUID(ev);
          if (position  == "crew" || position == "passengers")
          {
              ev.dataTransfer.setData("text/plain", JSON.stringify(foundry.utils.mergeObject(this.document.system.actors.documents.find(i => i.uuid == uuid)?.toDragData(), {previousPosition : position})));
              this.document.update(this.document.system.actors.removeId(uuid));
          }   
          else 
          {
              return super._onDragStart(ev);
          }
      }

      static async _onCreateItem(ev, target) 
      {
          let type = this._getType(ev);
          let category = target.dataset.category;
          this.document.createEmbeddedDocuments("Item", [{type, name : `New ${game.i18n.localize(CONFIG.Item.typeLabels[type])}`, system : {category}}]).then(item => item[0].sheet.render(true));
      }
  

      async _onDropActor(data, ev)
      {
        let actor = await Actor.fromDropData(data);
        let position = this._getDataAttribute(ev, "position");

        // If this actor was dragged from a different position onto an actor in the new position, swap the actors
        let previous = data.previousPosition
        let ontoUuid = this._getUUID(ev);

        this.actor.system.addActor(actor, position, {switchUuid : ontoUuid, previousPosition: previous})
      }

      async _onDropItem(data, ev)
      {
        let item = await Item.fromDropData(data);
        let position = this._getDataAttribute(ev, "position");

        if (item.type == "weapon" || !position)
        {
          this.actor.system.addWeapon(item, position)
        }
        else 
        {
          super._onDropItem(data, ev);
        }
      }

      static _onActorDelete(ev, target)
      {
        let id = this._getUUID(ev);
        this.document.update(this.document.system.actors.removeId(id));
      }

      static _onShowPassenger(ev, target)
      {
        let id = this._getUUID(ev);
        fromUuid(id).then(actor => actor.sheet.render(true));
      }

      static async _onDeleteEmbeddedDoc(ev, target)
      {
          let doc = await this._getDocumentAsync(ev, target);
          let position = this._getDataAttribute(ev, "position");

          if (position)
          {
            let choice = await foundry.applications.api.Dialog.wait({
              window: {title : doc.name},
              content : game.i18n.localize("IMPMAL.DeleteVehicleWeapon"),
              buttons : [
                {
                  action : "cargo",
                  label : "IMPMAL.Cargo"
                },
                {
                  action : "delete",
                  label : "IMPMAL.Delete"
                }
              ]
            })

            if (position)
            {
              await this.document.update(this.document.system[position].weapons.removeId(doc.id));
            }

            if (choice == "delete")
            {
              await doc?.deleteDialog();
            }
          }
          else 
          {
            doc?.deleteDialog();
          }

      }

      static async _onRollTest(ev, target)
      {
          let type = target.dataset.type;  // characteristic, skill, etc.
          let itemId = this._getId(ev);                   // Item ids, if using skill items or weapons
          let position = this._getDataAttribute(ev, "position");
          let item = this.actor.items.get(itemId);
          let actor = await this.actor.system.choose(position);

          if (!actor)
          {
            return;
          }

          switch(type)
          {
          case "weapon":
              return actor.setupWeaponTest(item.uuid);
          case "trait":
              return actor.setupTraitTest(item.uuid);
          case "item":
              return actor.setupTestFromItem(item.uuid);
          }
      }

      
    static _onActionClick(ev)
    {
        this.actor.useAction(ev.target.dataset.actionKey);
    }

    static _onToggleDriver(ev, target)
    {
      let uuid = this._getUUID(ev, target);
      this.actor.system.assignDriver(uuid);
    }

    static _onVehicleControl(ev, target)
    {
      this.actor.system.vehicleControl();
    }

  
}