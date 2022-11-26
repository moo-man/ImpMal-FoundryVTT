import { DocumentListModel } from "./list";

let fields = foundry.data.fields;

export class SkillsModel extends foundry.abstracts.DataModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.athletics = new fields.EmbeddedDataField(SkillModel);
        schema.awareness = new fields.EmbeddedDataField(SkillModel);
        schema.dexterity = new fields.EmbeddedDataField(SkillModel);
        schema.discipline = new fields.EmbeddedDataField(SkillModel);
        schema.fortitude = new fields.EmbeddedDataField(SkillModel);
        schema.intuition = new fields.EmbeddedDataField(SkillModel);
        schema.linguistics = new fields.EmbeddedDataField(SkillModel);
        schema.logic = new fields.EmbeddedDataField(SkillModel);
        schema.lore = new fields.EmbeddedDataField(SkillModel);
        schema.medicae = new fields.EmbeddedDataField(SkillModel);
        schema.melee = new fields.EmbeddedDataField(SkillModel);
        schema.navigation = new fields.EmbeddedDataField(SkillModel);
        schema.presence = new fields.EmbeddedDataField(SkillModel);
        schema.piloting = new fields.EmbeddedDataField(SkillModel);
        schema.psychic = new fields.EmbeddedDataField(SkillModel);
        schema.ranged = new fields.EmbeddedDataField(SkillModel);
        schema.rapport = new fields.EmbeddedDataField(SkillModel);
        schema.reflexes = new fields.EmbeddedDataField(SkillModel);
        schema.stealth = new fields.EmbeddedDataField(SkillModel);
        schema.tech = new fields.EmbeddedDataField(SkillModel);
        return schema;
    }

    computeTotals() 
    {
        for(let sk of this)
        {
            sk.computeTotal();
        }
    }
}

export class SkillModel extends foundry.abstracts.DataModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.characteristic = new fields.StringField({required: true, nullable : false, default: "ws"});
        schema.advances = new fields.NumberField({min: 0, max: 4});
        schema.specialisations = new fields.EmbeddedDataField(DocumentListModel);
        return schema;
    }

    computeTotal(characteristics) 
    {
        this.total = characteristics[this.characteristic].total + (5 * this.advances);
    }
}