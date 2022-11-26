let fields = foundry.data.fields;

export class CharacteristicsModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.ws = new fields.EmbeddedDataField(CharacteristicModel);
        schema.bs = new fields.EmbeddedDataField(CharacteristicModel);
        schema.str = new fields.EmbeddedDataField(CharacteristicModel);
        schema.tgh = new fields.EmbeddedDataField(CharacteristicModel);
        schema.ag = new fields.EmbeddedDataField(CharacteristicModel);
        schema.int = new fields.EmbeddedDataField(CharacteristicModel);
        schema.per = new fields.EmbeddedDataField(CharacteristicModel);
        schema.wil = new fields.EmbeddedDataField(CharacteristicModel);
        schema.fel = new fields.EmbeddedDataField(CharacteristicModel);
        return schema;
    }

    computeTotals() 
    {
        for(let ch of this)
        {
            ch.computeTotal();
        }
    }

    computeBonuses() 
    {
        for(let ch of this)
        {
            ch.computeBonus();
        }
    }
}

class CharacteristicModel extends foundry.abstracts.DataModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.starting = fields.NumberField();
        schema.modifier = fields.NumberField();
        schema.advances = fields.NumberField();
        return schema;
    }


    computeTotal() 
    {
        this.total = this.starting + this.modifier + this.advances;
    }

    computeBonus() 
    {
        this.bonus = Math.floor(this.total / 10);
    }
}