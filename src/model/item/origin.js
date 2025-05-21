import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class OriginModel extends StandardItemModel 
{
    static LOCALIZATION_PREFIXES = ["WH.Models.origin"];
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.equipment = new fields.EmbeddedDataField(DiffReferenceListModel);
        schema.talents = new fields.EmbeddedDataField(DiffReferenceListModel);
        schema.factionTable = new fields.EmbeddedDataField(DeferredReferenceModel),
        schema.characteristics = new fields.SchemaField({
            base : new fields.StringField(),
            choices : new fields.ArrayField(new fields.StringField())
        });
        return schema;
    }

    computeDerived()
    {
    }

    async applyOriginTo(actor)
    {
        let characteristics = actor.toObject().system.characteristics;

        let characteristicChoice = await ItemDialog.create(this.characteristics.choices.map(c => {return {id : c, name : game.impmal.config.characteristics[c]};}), 1, {text : game.i18n.localize("IMPMAL.ApplyOriginPrompt"), title : game.i18n.localize("IMPMAL.ApplyOriginTitle")});

        if (characteristicChoice.length)
        {
            if (this.characteristics.base)
            {
                characteristics[this.characteristics.base].starting += 5;
            }
            characteristics[characteristicChoice[0].id].starting += 5;
            
            await actor.update({"system.characteristics" : characteristics});
            await actor.createEmbeddedDocuments("Item", await Promise.all(this.equipment.documents));
            ui.notifications.notify(game.i18n.format("IMPMAL.OriginApplied", {name : this.parent.name}));

            let factionTable = await this.factionTable.document;
            if (factionTable && await Dialog.confirm({title : game.i18n.localize("IMPMAL.RollFaction"), content : game.i18n.format("IMPMAL.RollFactionContent", {name : factionTable.name})}))
            {
                let result = (await factionTable.draw())?.results[0];
                if (result)
                {
                    let uuid = (result.type == 1 ? result.documentCollection : `Compendium.${result.documentCollection}`) + `.${result.documentId}`;
                    let faction = await fromUuid(uuid);
                    if (faction)
                    {
                        actor.createEmbeddedDocuments("Item", [faction]);
                    }
                    else 
                    {
                        ui.notifications.error("Could not find faction " + uuid);
                    }
                }
            }
        }
    }

    
    async _onCreate(data, options, user)
    {
        await super._onCreate(data, options, user)
        if (["character", "npc"].includes(this.parent.actor?.type) && !this.parent.actor?.system.origin?.id && !options.skipOrigin)
        {
            this.applyOriginTo(this.parent?.actor);
        }
    }
}