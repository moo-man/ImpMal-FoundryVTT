import { ImpMalActor } from "../../document/actor";
import { ItemInfluenceModel } from "./components/influence";
import { DualItemModel } from "./dual";

export class DutyModel extends DualItemModel 
{
    static LOCALIZATION_PREFIXES = ["WH.Models.duty"];
    static defineSchema() 
    {
        let fields = foundry.data.fields;
        // Patron Fields
        let schema = super.defineSchema();

        schema.faction = new fields.EmbeddedDataField(DeferredReferenceModel);
        schema.category = new fields.StringField({initial : "character"});
        foundry.utils.mergeObject(schema.patron.fields, {
            boonTable : new fields.EmbeddedDataField(DeferredReferenceModel, {}, {name : "boonTable", parent : schema.patron}),
            liabilityTable : new fields.EmbeddedDataField(DeferredReferenceModel, {}, {name : "liabilityTable", parent : schema.patron}),
            boon : new fields.EmbeddedDataField(DeferredReferenceModel, {}, {name : "boon", parent : schema.patron}),
            influence : new fields.EmbeddedDataField(ItemInfluenceModel, {}, {name : "influence", parent : schema.patron}),
        });


        // Character Fields
        foundry.utils.mergeObject(schema.character.fields, {
            equipment : new fields.EmbeddedDataField(DeferredReferenceListModel, {}, {name : "equipment"}),
            characteristics : new fields.ObjectField({}, {}, {name : "characteristics"}),
            skills : new fields.ObjectField({}, {}, {name : "skills"}),
            specialisations : ListModel.createListModel(new fields.SchemaField({
                skill : new fields.StringField(),
                name : new fields.StringField(),
                advances : new fields.NumberField()
            }), {}, {name : "specialisations"}),
            influence : new fields.EmbeddedDataField(ItemInfluenceModel, {}, {name : "influence", parent : schema.character}),
            items : new fields.EmbeddedDataField(ChoiceModel, {}, {name : "items"}),
            solars : new fields.NumberField({min : 0}, {}, {name : "solars"}),
        });
        return schema;
    }

    async summaryData()
    {
        let data = await super.summaryData();
        data.details.item.faction = `${game.i18n.localize("IMPMAL.Faction")}: ${this.faction}`;
        return data;
    }

    async applyDutyTo(actor)
    {
        let data = actor.toObject();
        let items = [];
        for(let ch in this.character.characteristics)
        {
            if (this.character.characteristics[ch])
            {
                data.system.characteristics[ch].starting += this.character.characteristics[ch];
            }
        }

        for(let ch in this.character.skills)
        {
            if (this.character.skills[ch])
            {
                data.system.skills[ch].advances += this.character.skills[ch];
            }
        }

        let specialisations = await game.impmal.utility.getAllItems("specialisation");
        for(let spec of this.character.specialisations.list)
        {
            let found = specialisations.find(i => i.name == spec.name && i.system.skill == spec.skill);
            let data;
            if (found)
            {
                data = found.toObject();
                data.system.advances = spec.advances;
            }
            else if (spec.skill && spec.name && spec.advances)
            {
                data = {type : "specialisation", img : "modules/impmal-core/assets/icons/generic.webp", name : spec.name, system : {skill : spec.skill, advances : spec.advances}};
            }

            if (data)
            {
                items.push(data);
            }
        }

        for(let option of this.character.items.options)
        {
            if (option.type == "placeholder")
            {
                items.push({name : option.name, type : "equipment"});
            }
            else if (option.type == "item")
            {
                let item;
                if (option.idType == "id")
                {
                    item = await game.impmal.utility.findId(option.documentId);
                }
                else if (option.idType == "uuid")
                {
                    item = await fromUuid(option.documentId);
                }

                let data = item?.toObject() || {};

                foundry.utils.mergeObject(data, option.diff);
                data.name = option.name;
                items.push(data);
            }
        }

        data.system.solars += this.character.solars;

        if (actor.type == "npc")
        {
            data.name = this.parent.name;
        }
        else if (actor.type == "character")
        {
            let temp = new ImpMalActor(data);
            temp.prepareData();
            let expSpent = temp.system.xp.spent;
            data.system.xp.other.list.push({description : this.parent.name, xp : -1 * expSpent});
            for(let item of items)
            {
                delete item._id;
                if (item.type =="talent")
                {
                    item.system.xpCost = 0;
                }
            }
        }
        await actor.update({system : data.system});
        await actor.createEmbeddedDocuments("Item", items, {skipRequirement : true});
        ui.notifications.notify(game.i18n.format("IMPMAL.DutyApplied", {name : this.parent.name}));
    }

    async allowCreation(data, options, user)
    {
        let allowed = await super.allowCreation(data, options, user);

        if (this.category == this.parent.actor?.type || (this.category == "character" && this.parent.actor?.type == "npc")) // can add character duties to npcs for quick stats
        {
            if (this.category == "character")
            {
                let apply = await Dialog.confirm({title : game.i18n.localize("IMPMAL.ApplyDuty"), content : game.i18n.localize("IMPMAL.ApplyDutyContent")});
                if (apply)
                {
                    this.applyDutyTo(this.parent?.actor);
                }
                allowed = false;
            }
        }
        else 
        {
            allowed = false;
            ui.notifications.error("IMPMAL.ErrorPatronDutyCharacter", {localize : true});
        }
        return allowed;
    }


}