let fields = foundry.data.fields;

export class TestDataModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.self = new fields.BooleanField({})
        schema.difficulty =  new fields.StringField(),
        schema.characteristic =  new fields.StringField(),
        schema.skill = new fields.SchemaField({
            specialisation :  new fields.StringField(),
            key :  new fields.StringField(),
        });
        return schema;
    }

    get label()
    {
        return this.constructor.createLabelFromData(this)
    }

    static createLabelFromData(data)
    {
        let config = game.impmal.config;
        
        let label = config.characteristics[data.characteristic];
        
        // Replace name from characteristic to skill if test specifies
        if (data.skill?.key)
        {
            label = config.skills[data.skill.key];
        }
        // Add specialisation if available
        if (data.skill?.specialisation)
        {
            label += ` (${data.skill.specialisation})`;
        }

        if (data.difficulty)
        {
            let difficulty = game.impmal.config.difficulties[data.difficulty];
            label = `${difficulty.name} (${difficulty.modifier >= 0 ? "+" : ""}${difficulty.modifier}) ${label}`;
        }

        return label;
    }

    
    get isValid()
    {
        return this.difficulty && (this.characteristic || this.skill.key || this.skill.specialisation);
    }
    
    get enabled()
    {
        return this.isValid;
    }

}