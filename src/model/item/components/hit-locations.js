let fields = foundry.data.fields;

export class HitLocationsModel extends ListModel
{

    static get listSchema() {return new foundry.data.fields.StringField()};

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.label = new fields.StringField();
        return schema;
    }
}