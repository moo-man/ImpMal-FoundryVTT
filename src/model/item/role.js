import { ChoiceModel } from "../shared/choices";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class RoleModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.skills = new fields.SchemaField({
            value : new fields.NumberField({min: 0}),
            list : new fields.ArrayField(new fields.StringField())
        }),
        schema.specialisations = ListModel.createListModel(new fields.SchemaField({
            value : new fields.NumberField(),
            keys : new fields.ArrayField(new fields.StringField())
        }))
        schema.equipment = new fields.EmbeddedDataField(ChoiceModel);
        schema.talents = ListModel.createListModel(new fields.SchemaField({
            number : new fields.NumberField({min : 0})
        }))
        return schema;
    }

    computeDerived()
    {
    }
}