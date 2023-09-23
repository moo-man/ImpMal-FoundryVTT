import { DocumentListModel } from "../shared/list";
import { VehicleDocumentModel } from "../shared/reference";
import { BaseActorModel } from "./base";
let fields = foundry.data.fields;

export class VehicleModel extends BaseActorModel
{
    static preventItemTypes = ["duty", "role", "boonLiability", "origin", "specialisation", "talent", "injury", "power"];

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        schema.actors = new fields.EmbeddedDataField(VehicleActorList);
        schema.crew = new fields.SchemaField({ 
            number : new fields.NumberField({min: 0})
        });
        schema.passengers = new fields.SchemaField({ 
            number : new fields.NumberField({min: 0})
        });
        schema.combat = new fields.SchemaField({
            size : new fields.StringField(),
            armour : new fields.SchemaField({
                front : new fields.NumberField({min : 0, default: 0}),
                back : new fields.NumberField({min : 0, default: 0})
            }),
            speed : new fields.SchemaField({
                land : new fields.SchemaField({
                    value : new fields.StringField(),
                    modifier : new fields.NumberField({default : 0})
                }),
                fly : new fields.SchemaField({
                    value : new fields.StringField(),
                    modifier : new fields.NumberField({default: 0})
                })
            })
        });
        return schema;
    }

    computeDerived(items)
    {
        super.computeDerived(items);
        this.actors.findDocuments(game.actors);
        this.crew.actors = this.actors.list.filter(i => i.position == "crew").map(i => this.actors.documents.find(actor => actor.id == i.id));
        this.passengers.actors = this.actors.list.filter(i => i.position == "passengers").map(i => this.actors.documents.find(actor => actor.id == i.id));
    }
}

export class VehicleActorList extends DocumentListModel
{
    static defineSchema()
    {
        let schema = super.defineSchema();
        schema.list = new fields.ArrayField(new fields.EmbeddedDataField(VehicleDocumentModel));
        return schema;
    }

    addDocument(document, position="crew")
    {
        return this.add({
            id : document.id,
            name : document.name,
            type : document.documentName,
            position : position
        });
    }
}