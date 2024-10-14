let fields = foundry.data.fields;

export class SkillsModel extends foundry.abstract.DataModel
{
    static defineSchema() 
    {
        let schema = {};
        schema.athletics = SkillModel.createModel("str");
        schema.awareness = SkillModel.createModel("per");
        schema.dexterity = SkillModel.createModel("ag");
        schema.discipline = SkillModel.createModel("wil");
        schema.fortitude = SkillModel.createModel("tgh");
        schema.intuition = SkillModel.createModel("per");
        schema.linguistics = SkillModel.createModel("int");
        schema.logic = SkillModel.createModel("int");
        schema.lore = SkillModel.createModel("int");
        schema.medicae = SkillModel.createModel("int");
        schema.melee = SkillModel.createModel("ws");
        schema.navigation = SkillModel.createModel("int");
        schema.presence = SkillModel.createModel("ag");
        schema.piloting = SkillModel.createModel("wil");
        schema.psychic = SkillModel.createModel("wil");
        schema.ranged = SkillModel.createModel("bs");
        schema.rapport = SkillModel.createModel("fel");
        schema.reflexes = SkillModel.createModel("ag");
        schema.stealth = SkillModel.createModel("ag");
        schema.tech = SkillModel.createModel("int");
        return schema;
    }

    computeTotals(characteristics) 
    {
        for(let sk in this)
        {
            this[sk].computeTotal(characteristics);
        }
    }

    findSpecialisations(specialisations)
    {
        for(let sk in this)
        {
            this[sk].specialisations = [];
        }

        for(let item of specialisations)
        {
            try 
            {
                this[item.system.skill].specialisations.push(item);
            }
            catch (e)
            {
                warhammer.utility.log("Error assigning skill specialisation:", {args: item});
            }
        }
    }
}

export class SkillModel extends foundry.abstract.DataModel 
{
    static _characteristic = "";

    static defineSchema() 
    {
        let schema = {};
        schema.characteristic = new fields.StringField({initial : this._characteristic});
        schema.advances = new fields.NumberField({min: 0, initial: 0});
        schema.modifier = new fields.NumberField({initial : 0});
        return schema;
    }

    static createModel(characteristic)
    {
        return new fields.EmbeddedDataField(class cls extends SkillModel {
            static _characteristic = characteristic
        })
    }

    computeTotal(characteristics) 
    {
        this.characteristicData = characteristics[this.characteristic];
        this.total = this.characteristicData.total + (5 * this.advances) + this.modifier;
    }

    getTotalFor(characteristic, actor)
    {
        if (!characteristic)
        {
            characteristic = this.characteristic;
        }
        return actor.system.characteristics[characteristic].total + (5 * this.advances) + this.modifier;
    }
}