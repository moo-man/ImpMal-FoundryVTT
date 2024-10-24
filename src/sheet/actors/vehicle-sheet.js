import ImpMalActorSheet from "./actor-sheet";

export default class ImpMalVehicleSheet extends ImpMalActorSheet
{

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat("vehicle");
        options.height = 600;
        options.width = 530;
        options.dragDrop.push([{ dragSelector: ".actor-list .actor", dropSelector: null }]);
        return options;
    }

    async getData() 
    {
        let data = await super.getData();
        return data;
    }

    async _onDrop(ev)
    {
        let dropData = JSON.parse(ev.dataTransfer.getData("text/plain"));
        if (dropData.type == "Actor")
        {
            let actor = await Actor.fromDropData(dropData);
            if (actor.type == "character" || actor.type == "npc")
            {
                let position = this._getDataAttribute(ev, "position");
                let newList = Object.values(this.object.system.actors.add(actor, position))[0];

                let ontoActorId = this._getUUID(ev);
                // If this actor was dragged from a different position onto an actor in the new position, swap the actors
                if (ontoActorId && dropData.previousPosition)
                {
                    let ontoActor = newList.find(i => i.uuid == ontoActorId);
                    ontoActor.updateSource({position : dropData.previousPosition});
                }

                this.object.update({"system.actors.list" : newList});
            }
        }
        else 
        {
            super._onDrop(ev);
        }
    }

    _onDragStart(ev)
    {
        let position = this._getDataAttribute(ev, "position");
        let uuid = this._getUUID(ev);
        if (position  == "crew" || position == "passengers")
        {
            ev.dataTransfer.setData("text/plain", JSON.stringify(foundry.utils.mergeObject(this.object.system.actors.documents.find(i => i.uuid == uuid)?.toDragData(), {previousPosition : position})));
            this.object.update(this.object.system.actors.removeId(uuid));
        }   
        else 
        {
            return super._onDragStart(ev);
        }
    }

    activateListeners(html) 
    {
        super.activateListeners(html);
        if (!this.isEditable)
        {
            return;
        }
        
        html.find(".crew,.passengers").on("dragenter", (ev => 
        {
            ev.currentTarget.classList.add("hover");
        }));

        
        html.find(".crew,.passengers").on("dragleave", (ev => 
        {
            ev.currentTarget.classList.remove("hover");
        }));


        html.find(".actor-delete").on("click", (ev => 
        {
            ev.stopPropagation();
            ev.preventDefault();
            let id = this._getUUID(ev);
            this.object.update(this.object.system.actors.removeId(id));

        }));
    
        
        html.find(".actor-edit").on("click", (ev => 
            {
                ev.stopPropagation();
                ev.preventDefault();
                let id = this._getUUID(ev);
                fromUuid(id).then(actor => actor.sheet.render(true));
    
            }));

        html.find(".mag").on("click", ev => 
        {
            let id = this._getId(ev);
            let item = this.actor.items.get(id);

            item.update(item.system.reload(!!item.system.ammo.document)).then(() => 
            {
                ui.notifications.notify(game.i18n.localize("IMPMAL.Reloaded"));
            });

        });

        html.find(".mag").on("contextmenu", ev => 
        {
            let id = this._getId(ev);
            let item = this.actor.items.get(id);

            item.update(item.system.useAmmo());

        });

        
        html.find(".ammo-used").on("click", ev => 
        {
            let id = this._getId(ev);
            let item = this.actor.items.get(id);
            if (this.actor.itemTypes.ammo.length == 0)
            {
                ui.notifications.error(game.i18n.localize("IMPMAL.ErrorNoAmmoItems"));
                return;
            }
            ItemDialog.create(this.actor.itemTypes.ammo).then(documents => 
            {
                let ammo = documents[0];
                item.update({"system.ammo.id" : ammo?.id});
            });
        });

        html.find(".ammo-used").on("contextmenu", ev => 
        {
            let id = this._getId(ev);
            let item = this.actor.items.get(id);
            item.update({"system.ammo.id" : ""});
        });
    }


}