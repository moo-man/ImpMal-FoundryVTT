let fields = foundry.data.fields;
/**
 * Abstract class that interfaces with the Actor class
 */
export class BaseActorModel extends BaseWarhammerActorModel 
{

    static defineSchema() 
    {
        let schema = {};
        schema.notes = new fields.SchemaField({
            player : new fields.StringField(),
            gm : new fields.StringField()
        });

        return schema;
    }
    
    async _preCreate(data, options, user) 
    {
        super._preCreate(data, options, user)
        if (!data.prototypeToken)
        {
            this.parent.updateSource({
                "prototypeToken.name" : data.name,
                "prototypeToken.displayName" : CONST.TOKEN_DISPLAY_MODES.HOVER,
                "prototypeToken.displayBars" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
            });
        }
    }

    initialize() 
    {

    }
    
    computeBase() 
    {
        this.initialize();
    }
}