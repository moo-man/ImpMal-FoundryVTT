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
        let actors;
        if (position == "any")
        {
            actors = this.crew.actors.concat(this.passengers.actors).filter(i => i?.isOwner);
        }
        else 
        {
            actors = this[position].actors.filter(i => i?.isOwner);
        }

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

    get driver()
    {
        return this.actors.list.find(i => i.driver)?.document
    }

    assignDriver(uuid)
    {
        let index = this.actors.list.findIndex(a => a.uuid == uuid);

        if (index != -1)
        {
            if (uuid == this.driver?.uuid)
            {
                return this.parent.update(this.actors.edit(index, {driver : false}));
            }

            // Clear all drivers
            let actors = this.actors.toObject().list.map(a => {
                a.driver = false;
                return a;
            }) 
            
            // Assign new driver
            actors[index].driver = true;
            actors[index].position = "crew";

            this.parent.update({"system.actors.list" : actors});
        }
    }

    addActor(actor, position, {switchUuid=null, previousPosition})
    {
        if (!["vehicle", "patron"].includes(actor.type))
        {
            let newList = Object.values(this.actors.add(actor, position))[0];

            if (switchUuid && previousPosition)
            {
                let switchActor = newList.find(i => i.uuid == switchUuid);
                switchActor.updateSource({position : previousPosition});
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

    async useAction(action)
    {
        let actionData = game.impmal.config.vehicleActions[action];
        let effectAdded = false; // Flag effect being added so scrolling text doesn't overlap

        if (actionData.execute)
        {
            actionData.execute(this.parent);
        }
        else if (actionData.effect)
        {
            effectAdded = await this.parent.applyEffect({effects : new ActiveEffect.implementation(actionData.effect, {parent: this.parent})});
        }
        else if (actionData)
        {
            let actor;
            let testData = {key: actionData.skill || "piloting"};
            let testOptions = {appendTitle : ` - ${actionData.name}`, fields : {difficulty : actionData.difficulty}};

            if (actionData.position)
            {
                actor = await this.choose(actionData.position);
            }
            else if (this.driver)
            {
                actor = this.driver
            }
            else 
            {
                actor = await this.choose("crew");
            }
            actor.setupSkillTest(testData, testOptions)
        }
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

    async applyDamage(value, {ignoreAP=false, location="", message=false, opposed, context={}}={})
    {   
        let modifiers = [];
        let traits = opposed?.attackerTest?.itemTraits;
        if (!["back", "front"].includes(location))
        {
            location  = await foundry.applications.api.Dialog.wait({
                window : {title : "Damage Direction"},
                content : `<p>Use Front (${this.combat.armour.front}) or Back (${this.combat.armour.back}) Armour?</p>`,
                buttons : [
                    {
                        action : "front",
                        label : "Front"
                    },
                    {
                        action : "back",
                        label : "Back"
                    }
                ]
            })
        }

        let args = {actor : this.parent, value, ignoreAP, modifiers, locationData: {direction: location}, opposed, traits, vehicle : true, context};
        await Promise.all(opposed?.attackerTest?.actor.runScripts("preApplyDamage", args) || []);
        await Promise.all(opposed?.attackerTest?.item?.runScripts?.("preApplyDamage", args) || []);
        await Promise.all(this.parent.runScripts("preTakeDamage", args)); 
        // Reassign primitive values that might've changed in the scripts
        let damage = args.value;
        ignoreAP = args.ignoreAP;

        for (let modifier of modifiers)
        {
            // Skip modifier if it's from armour when ignoreAP is true, or if the modifier has already been applied
            if (!modifier.applied && (!modifier.armour || !ignoreAP))
            {
                damage += Number(modifier.value || 0);
            }
        }
        damage= Math.max(0, damage);


        let excess = 0;
        let critical = false;
        if (damage > this.combat.armour[location])
        {
            excess = damage - this.combat.armour[location];
            critical = true;
        }

        let critModifier = opposed?.attackerTest?.result.critModifier;
        let text = "";
        args = {actor : this.parent, woundsGained : 0, damage, opposed, critModifier, locationData: {direction: location}, excess, critical, text, modifiers, vehicle : true, context};
        await Promise.all(opposed?.attackerTest?.actor.runScripts("applyDamage", args) || []);
        await Promise.all(opposed?.attackerTest?.item?.runScripts?.("applyDamage", args) || []);
        await Promise.all(this.parent.runScripts("takeDamage", args)); 
        critModifier = args.critModifier;
        excess = args.excess;
        critical = args.critical;
        text = args.text;
        // A script might replace text
        text = text || game.i18n.format("IMPMAL.DamageTaken", {damage, location : game.i18n.localize(`IMPMAL.${location.capitalize()}`)});

        let critFormula = ``;
        if (excess)
        {
            critFormula += " + " + excess;
            if (critModifier)
            {
                critFormula +=  " + " + critModifier;
            }
        }
        let critString;
        let critKey = `crit${this.category}`
        if (!game.impmal.tables.findTable(critKey))
        {
            critKey = "critvehicle";
        }

        critString = ` <a class="table-roll" data-table="${critKey}" data-formula="1d10 + ${critFormula}"><i class="fa-solid fa-dice-d10"></i>Critical ${critFormula}</a>`;

        let damageData = {
            damage : value,
            text, 
            message : message ? ChatMessage.create({content : (`<p>${text}</p>` + `<p>${(critString ? critString : "")}</p>`), speaker : ChatMessage.getSpeaker({actor : this.parent})}) : null,
            modifiers,
            critical : critString,
            excess,
            location
        };

        return damageData;
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
        schema.driver = new fields.BooleanField();
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
            position : position,
            driver : false
        });
    }
}