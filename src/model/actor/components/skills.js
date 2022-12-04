let fields = foundry.data.fields;

export class SkillsModel extends foundry.abstract.DataModel
{
    static defineSchema() 
    {
        let schema = {};
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

    computeTotals(characteristics) 
    {
        for(let sk in this)
        {
            this[sk].computeTotal(characteristics);
        }
    }

    findSpecialisations(skills)
    {
        for(let sk in this)
        {
            this[sk].specialisations = [];
        }

        for(let item of skills)
        {
            try 
            {
                this[item.system.skill].specialisations.push(item);
            }
            catch (e)
            {
                game.impmal.log("Error assigning skill specialisation:", {args: item});
            }
        }
    }
}

export class SkillModel extends foundry.abstract.DataModel 
{

    initialize() 
    {

    }

    static defineSchema() 
    {
        let schema = {};
        schema.characteristic = new fields.StringField();
        schema.advances = new fields.NumberField({min: 0, max: 4, initial: 0});
        return schema;
    }

    computeTotal(characteristics) 
    {
        this.total = characteristics[this.characteristic].total + (5 * this.advances);
    }
}