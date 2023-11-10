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

    summaryData()
    {
        let data = super.summaryData();
        data.details.item.faction = `${game.i18n.localize("IMPMAL.Faction")}: ${this.faction}`;
        return data;
    }

}