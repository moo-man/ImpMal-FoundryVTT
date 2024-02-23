import DocumentChoice from "../../apps/document-choice";
import { ChoiceModel } from "../shared/choices";
import { DeferredDocumentListModel } from "../shared/list";
import { ItemInfluenceModel } from "./components/influence";
import { DualItemModel } from "./dual";
let fields = foundry.data.fields;

export class FactionModel extends DualItemModel 
{
    static defineSchema() 
    {
        // Patron Fields
        let schema = super.defineSchema();
        mergeObject(schema.patron.fields, {
            duty : new fields.EmbeddedDataField(DeferredDocumentListModel),
            influence : new fields.EmbeddedDataField(ItemInfluenceModel),
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
            influence : new fields.EmbeddedDataField(ItemInfluenceModel),
            talents : new fields.EmbeddedDataField(ChoiceModel),
            equipment : new fields.EmbeddedDataField(ChoiceModel),
            solars : new fields.NumberField(),
            duty : new fields.EmbeddedDataField(DeferredDocumentListModel),
        });
        return schema;
    }


    async createChecks(data, options, user)
    {
        if (["character", "npc"].includes(this.parent.actor?.type))
        {
            let duties = await this.character.duty.getDocuments();
            if (duties.length >= 1)
            {
                DocumentChoice.create(duties, 1, {text : game.i18n.localize("IMPMAL.DutyChoice"), title : game.i18n.localize("IMPMAL.ApplyDuty")}).then(duty => 
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