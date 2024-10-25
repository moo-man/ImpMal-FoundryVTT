export class ImpMalMessageModel extends WarhammerTestMessageModel 
{
    static defineSchema() 
    {
        let fields = foundry.data.fields;
        let schema = {};
        schema.context = new fields.ObjectField();
        schema.data = new fields.ObjectField();
        schema.result = new fields.ObjectField();
        schema.class = new fields.StringField();
        return schema;
    }

    get test() 
    {
        let test = new (game.impmal.testClasses[this.class])(this);
        return test;
    }
}