let fields = foundry.data.fields;

export class BaseCombatModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.size = new fields.StringField();
        schema.speed = new fields.StringField();
        schema.fly = new fields.StringField();
        return schema;
    }
}


export class CharacterCombatModel extends BaseCombatModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.superiority = fields.NumberField();
        return schema;
    }
}

export class NPCCombatModel extends BaseCombatModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.resolve = fields.NumberField();
        return schema;
    }
}
