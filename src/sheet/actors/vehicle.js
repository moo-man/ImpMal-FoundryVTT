import ArmourConfig from "../../apps/armour-config";
import IMActorSheet from "./actor";

export default class VehicleSheet extends IMActorSheet
{

    factionsExpanded={}; // Retain expanded influence sections on rerender;

    static DEFAULT_OPTIONS = {
        classes: ["vehicle"],
        actions : {
          actorDelete : this._onActorDelete,
          showPassenger : this._onShowPassenger
        },
        defaultTab : "main"
      }

      static PARTS = {
        header : {scrollable: [""], classes : ["vehicle-header"], template : 'systems/impmal/templates/actor/vehicle/vehicle-header.hbs' },
        tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
        main: { scrollable: [""], template: 'systems/impmal/templates/actor/vehicle/vehicle-main.hbs' },
        cargo: { scrollable: [""], template: 'systems/impmal/templates/actor/vehicle/vehicle-cargo.hbs' },
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
        notes: {
          id: "notes",
          group: "primary",
          label: "IMPMAL.Notes",
        }
      }

      async _prepareContext(options)
      {
        let context = await super._prepareContext(options)
        return context;
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


      async _onDropActor(data, ev)
      {
        let actor = await Actor.fromDropData(data);
        if (actor.type == "character" || actor.type == "npc")
        {
            let position = this._getDataAttribute(ev, "position");
            let newList = Object.values(this.document.system.actors.add(actor, position))[0];

            let ontoActorId = this._getUUID(ev);
            // If this actor was dragged from a different position onto an actor in the new position, swap the actors
            if (ontoActorId && data.previousPosition)
            {
                let ontoActor = newList.find(i => i.uuid == ontoActorId);
                ontoActor.updateSource({position : data.previousPosition});
            }

            this.document.update({"system.actors.list" : newList});
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
}