import { ItemInfluenceModel } from "./components/influence";
import { DualItemModel } from "./dual";

export class FactionModel extends DualItemModel 
{
    static defineSchema() 
    {
        let fields = foundry.data.fields;
        // Patron Fields
        let schema = super.defineSchema();
        mergeObject(schema.patron.fields, {
            duty : new fields.EmbeddedDataField(DeferredReferenceListModel, {}, {parent : schema.patron, name : "duty"}),
            influence : new fields.EmbeddedDataField(ItemInfluenceModel, {}, {parent: schema.patron, name : "influence"}),
        });


        // Character Fields
        mergeObject(schema.character.fields, {
            characteristics : new fields.SchemaField({
                base : new fields.StringField(),
                choices : new fields.ArrayField(new fields.StringField())
            }),
            advances : new fields.SchemaField({
                value : new fields.NumberField({min: 0, initial: 5}),
                skills : new fields.ArrayField(new fields.StringField())
            }),
            influence : new fields.EmbeddedDataField(ItemInfluenceModel, {}, {parent: schema.character, name : "influence"}),
            talents : new fields.EmbeddedDataField(ChoiceModel, {}, {parent : schema.character, name : "talents"}),
            equipment : new fields.EmbeddedDataField(ChoiceModel, {}, {parent : schema.character, name : "equipment"}),
            solars : new fields.NumberField(),
            duty : new fields.EmbeddedDataField(DeferredReferenceListModel, {}, {parent : schema.character, name : "duty"}),
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