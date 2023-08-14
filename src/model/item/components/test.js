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

}