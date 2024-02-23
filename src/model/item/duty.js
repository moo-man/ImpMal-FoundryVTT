import { ImpMalActor } from "../../document/actor";
import { ChoiceModel } from "../shared/choices";
import { DeferredDocumentListModel } from "../shared/list";
import { DeferredDocumentModel } from "../shared/reference";
import { ItemInfluenceModel } from "./components/influence";
import { DualItemModel } from "./dual";
let fields = foundry.data.fields;

export class DutyModel extends DualItemModel 
{
    static defineSchema() 
    {
        // Patron Fields
        let schema = super.defineSchema();

        schema.faction = new fields.EmbeddedDataField(DeferredDocumentModel);
        schema.category = new fields.StringField({initial : "character"});
        mergeObject(schema.patron.fields, {
            boonTable : new fields.EmbeddedDataField(DeferredDocumentModel),
            liabilityTable : new fields.EmbeddedDataField(DeferredDocumentModel),
            boon : new fields.EmbeddedDataField(DeferredDocumentModel),
            influence : new fields.EmbeddedDataField(ItemInfluenceModel),
        });


        // Character Fields
        mergeObject(schema.character.fields, {
            equipment : new fields.EmbeddedDataField(DeferredDocumentListModel),
            characteristics : new fields.ObjectField({}),
            skills : new fields.ObjectField({}),
            influence : new fields.EmbeddedDataField(ItemInfluenceModel),
            items : new fields.EmbeddedDataField(ChoiceModel),
            solars : new fields.NumberField({min : 0}),
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


        for(let item of this.character.items.options)
        {
            if (item.type == "placeholder")
            {
                items.push({name : item.name, type : "equipment"});
            }
            else if (item.type == "item")
            {
                if (item.idType == "id")
                {
                    items.push(await game.impmal.utility.findId(item.documentId));
                }
                else if (item.idType == "uuid")
                {
                    items.push(await fromUuid(item.documentId));
                }
            }
        }

        items = items.map(i => i.toObject());

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
                if (item.type =="talent")
                {
                    item.system.xpCost = 0;
                }
            }
        }
        await actor.update(data);
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
        }
        return allowed;
    }


}