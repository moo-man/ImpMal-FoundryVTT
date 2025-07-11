import { BaseActorModel } from "./base";
let fields = foundry.data.fields;

export class VehicleModel extends BaseActorModel
{
    static preventItemTypes = ["duty", "role", "boonLiability", "origin", "specialisation", "talent", "injury", "power"];

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        schema.cost = new fields.NumberField({min: 0});
        schema.actors = new fields.EmbeddedDataField(VehicleActorList);
        schema.crew = new fields.SchemaField({ 
            number : new fields.NumberField({min: 0}),
            weapons : new fields.EmbeddedDataField(DocumentReferenceListModel)
        });
        schema.passengers = new fields.SchemaField({ 
            number : new fields.NumberField({min: 0}),
            weapons : new fields.EmbeddedDataField(DocumentReferenceListModel)
        });
        schema.combat = new fields.SchemaField({
            size : new fields.StringField(),
            armour : new fields.SchemaField({
                front : new fields.NumberField({min : 0, default: 0}),
                back : new fields.NumberField({min : 0, default: 0})
            }),
            speed : new fields.SchemaField({
                land : new fields.SchemaField({
                    value : new fields.StringField(),
                    modifier : new fields.NumberField({default : 0})
                }),
                fly : new fields.SchemaField({
                    value : new fields.StringField(),
                    modifier : new fields.NumberField({default: 0})
                })
            })
        });

        schema.autoCalc.fields.showPassengers = new fields.BooleanField({initial : true, label : "IMPMAL.ActorConfig.ShowPassengers"}, {name : "showPassengers", parent : schema.autoCalc});

        return schema;
    }

    _addModelProperties()
    {
        super._addModelProperties();
        this.crew.weapons.relative = this.parent.items;
        this.passengers.weapons.relative = this.parent.items;
    }

    computeDerived(items)
    {
        super.computeDerived(items);
        this.crew.actors = this.actors.list.filter(i => i.position == "crew").map(i => this.actors.documents.find(actor => actor.uuid == i.uuid)).filter(i => i);
        this.passengers.actors = this.actors.list.filter(i => i.position == "passengers").map(i => this.actors.documents.find(actor => actor.uuid == i.uuid)).filter(i => i);
    }

    async choose(position, filter)
    {
        let actors = this[position].actors.filter(i => i?.isOwner);

        if (filter)
        {
            actors = actors.filter(filter);
        }
        
        if (actors.length == 0)
        {
            ui.notifications.error("IMPMAL.ErrorNoAvailableActors", {localize: true})
            return
        }

        if (actors.length == 1)
        {
            return actors[0];
        }

        return (await ItemDialog.create(actors, 1, {title: game.i18n.localize("IMPMAL.ChooseActor")}))[0]
    }

    addActor(actor, position, {switchUuid=null, previousPosition})
    {
        if (!["vehicle", "patron"].includes(actor.type))
        {
            let newList = Object.values(this.actors.add(actor, position))[0];

            if (switchUuid && previousPosition)
            {
                let switchActor = newList.find(i => i.uuid == switchWith.uuid);
                switchActor.updateSource({position : data.previousPosition});
            }

            this.parent.update({"system.actors.list" : newList});
        }
    }

    async addWeapon(weapon, position)
    {
        if (weapon.actor?.uuid != this.parent.uuid)
        {
            weapon = await Item.implementation.create(weapon.toObject(), {parent: this.parent});
        }

        this.parent.update(this[position].weapons.add(weapon));
    }

    embedData(options)
    {
        try {
            let data = super.embedData(options);

            let traits = this.parent.itemTypes.trait.map(i => {
                return i.system.notes.player.replace("<p>", `<p><strong>${i.name}</strong>: `)
            });

            const createWeaponHTML = (weapon, type) => {
                return `<p><strong>${weapon.name} (${type})</strong>: ${game.i18n.localize({"melee" : "IMPMAL.Melee", "ranged" : "IMPMAL.Ranged"}[weapon.system.attackType])} (${weapon.system.specialisation}), ${weapon.system.damage.base} Damage, ${game.impmal.config.ranges[weapon.system.range]} Range. <span style="font-style: italic">${weapon.system.traits.displayString}<span>`
            }
        
            
            let weapons = 
            this.crew.weapons.documents.map(i => createWeaponHTML(i, "Crew")).concat(this.passengers.weapons.documents.map(i => createWeaponHTML(i, "Passenger"))).join("")

            return foundry.utils.mergeObject(data, {
                weapons, 
                traits : traits.join(""),
            })
        }
        catch(e)
        {
            return "Error getting embed data for " + this.parent.name
        }

    }
}


export class VehicleRiderDocumentModel extends DocumentReferenceModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.uuid = new fields.StringField();
        schema.name = new fields.StringField();
        schema.type = new fields.StringField();
        schema.position = new fields.StringField();
        return schema;
    }

}

export class VehicleActorList extends DocumentReferenceListModel
{
    static listSchema = VehicleRiderDocumentModel;

    add(document, position="crew")
    {
        return this._add({
            uuid : document.uuid,
            name : document.name,
            type : document.documentName,
            position : position
        });
    }
}