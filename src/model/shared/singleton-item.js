import { DocumentReferenceModel } from "./reference";
let fields = foundry.data.fields;

// Singleton items are items that actors should have only one of, such as Origin, Faction, and Role
export class SingletonItemModel extends DocumentReferenceModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.name = new fields.StringField();
        return schema;
    }

    getDocument(...args)
    {
        super.getDocument(...args);
        if (this.document)
        {
            this.name = this.document.name;
        }
    }

    updateSingleton(item)
    {
        game.impmal.log("New singleton item", {args : item});
        if (this.document)
        {
            game.impmal.log("Deleting old singleton item", {args: this.document});
            this.document.delete();
        }
        return {id : item.id};
    }
}