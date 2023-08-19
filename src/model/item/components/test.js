let fields = foundry.data.fields;

export class TestDataModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
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
        let config = game.impmal.config;
        
        let label = config.characteristics[this.characteristic];
        
        // Replace name from characteristic to skill if test specifies
        if (this.skill.key)
        {
            label = config.skills[this.skill.key];
        }
        // Add specialisation if available
        if (this.skill.specialisation)
        {
            label += ` (${this.skill.specialisation})`;
        }

        if (this.difficulty)
        {
            let difficulty = game.impmal.config.difficulties[this.difficulty];
            label = `${difficulty.name} (${difficulty.modifier >= 0 ? "+" : ""}${difficulty.modifier}) ${label}`;
        }

        return label;
    }

    
    get isValid()
    {
        return this.difficulty && (this.characteristic || this.skill);
    }


}