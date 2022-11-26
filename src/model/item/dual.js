
/**
 * Represents an Item used by both Patrons and Characters/NPCs
 */
export class DualItemModel extends foundry.abstract.DataModel 
{

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.patron = new fields.SchemaField({
            notes : new fields.SchemaField({
                player : new fields.StringField(),
                gm : new fields.StringField()
            })
        });

        schema.character = new fields.SchemaField({
            notes : new fields.SchemaField({
                player : new fields.StringField(),
                gm : new fields.StringField()
            })
        });

        return schema;
    }


}