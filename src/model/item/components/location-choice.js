let fields = foundry.data.fields;

export class LocationChoice extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.value = new fields.StringField();
        schema.choices = new fields.ArrayField(new fields.StringField());
        return schema;
    }


    async promptChoice(actor)
    {
        // If choice already made
        if (this.value)
        {
            return this.value;
        }

        let choice = "";
        if (this.choices.length <= 1)
        {
            choice = this.choices[0];
        }
        else 
        {
            let buttons = {};
            for(let choice of this.choices)
            {
                buttons[choice] = {
                    label : game.i18n.localize(actor.system.combat.hitLocations[choice]?.label),
                    callback : () => 
                    {
                        return choice;
                    }
                };
            }

            choice = await Dialog.wait({
                label : "Choose Location",
                content : "Choose Location",
                buttons : buttons
            });
        }
        return choice;
    }
}