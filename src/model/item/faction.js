import { ItemInfluenceModel } from "./components/influence";
import { DualItemModel } from "./dual";

export class FactionModel extends DualItemModel 
{
    static LOCALIZATION_PREFIXES = ["WH.Models.faction"];
    static defineSchema() 
    {
        let fields = foundry.data.fields;
        // Patron Fields
        let schema = super.defineSchema();
        foundry.utils.mergeObject(schema.patron.fields, {
            duty : new fields.EmbeddedDataField(DeferredReferenceListModel, {}, {name : "duty", parent : schema.patron}),
            influence : new fields.EmbeddedDataField(ItemInfluenceModel, {}, {name : "influence", parent : schema.patron}),
        });


        // Character Fields
        foundry.utils.mergeObject(schema.character.fields, {
            characteristics : new fields.SchemaField({
                base : new fields.StringField(),
                choices : new fields.ArrayField(new fields.StringField())
            }),
            advances : new fields.SchemaField({
                value : new fields.NumberField({min: 0, initial: 5}),
                skills : new fields.ArrayField(new fields.StringField())
            }),
            influence : new fields.EmbeddedDataField(ItemInfluenceModel, {}, {name : "influence", parent : schema.character}),
            talents : new fields.EmbeddedDataField(ChoiceModel, {}, {name : "talents", parent : schema.character}),
            equipment : new fields.EmbeddedDataField(ChoiceModel, {}, {name : "equipment", parent : schema.character}),
            solars : new fields.NumberField(),
            duty : new fields.EmbeddedDataField(DeferredReferenceListModel, {}, {name : "duty", parent : schema.character}),
        });
        return schema;
    }


    async _onCreate(data, options, user)
    {
        if (["character", "npc"].includes(this.parent.actor?.type) && !options.skipFaction)
        {
            let duties = await this.character.duty.documents;
            if (duties.length >= 1)
            {
                ItemDialog.create(duties, 1, {text : game.i18n.localize("IMPMAL.DutyChoice"), title : game.i18n.localize("IMPMAL.ApplyDuty")}).then(duty => 
                {
                    if (duty[0])
                    {
                        duty[0].system.applyDutyTo(this.parent?.actor);
                    }
                });
            }
        }
    }
}