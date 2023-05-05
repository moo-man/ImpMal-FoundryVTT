import { ListModel } from "../../shared/list";

let fields = foundry.data.fields;

export class TraitListModel extends ListModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.list = new fields.ArrayField(new fields.SchemaField({
            key : new fields.StringField(),
            value : new fields.StringField({nullable : true})
        }));

        return schema;
    }

    compute() 
    {
        this.original = this.clone(); // Keep a copy of the original object before ammo/mod modifications
    }

    has(key)
    {
        return this.list.find(i => i.key == key);
    }

    removeKey(key)
    {
        let index = this.list.findIndex(i => i.key == key);
        if (index != -1)
        {
            return super.remove(index);
        }
        else 
        {
            return this.list;
        }
    }

    add(traits, {replace=false}={})
    {

        if ((traits instanceof Array) == false)
        {
            traits = [traits];
        }

        // Don't add multiples
        traits = traits.filter(i => i.key && !this.has(key));

        if (replace)
        {
            return traits;
        }
        else 
        {
            return super.add(trait);
        }
    }

    /**
     * 
     * @param {TraitListModel} traits Traits to combine with
     * @param {Array} include If specified, only include these keys, otherwise include all
     */
    combine(traits, include)
    {
        for(let trait of traits.list)
        {
            // If include is specified and the trait key doesn't exist, don't add it
            if (include && !include.includes(trait.key))
            {
                continue;
            }
            let existing = this.has(trait.key);
            if (existing)
            {
                if (Number.isNumeric(existing.value) && Number.isNumeric(trait.value))
                {
                    existing.value = Number(existing.value) + Number(trait.value);
                }
                else 
                {
                    this.list.push(trait);
                }
            }
            else 
            {
                this.list.push(trait);
            }
        }
    }

    get displayArray()
    {
        return this.list
            .map(i => 
            {
                let display = game.impmal.config.weaponArmourTraits[i.key] || game.impmal.config.itemTraits[i.key];
                if (i.value)
                {
                    display += ` (${i.value})`;
                }
                return display;
            });
    }

    get htmlArray()
    {
        return this.list
            .map(i => 
            {
                let display = game.impmal.config.weaponArmourTraits[i.key] || game.impmal.config.itemTraits[i.key];
                if (i.value) {
                    display += ` (${i.value})`;
                }
                return `<a data-key=${i.key} data-value=${i.value}>${display}</a>`;
            });
    }

    get displayString() 
    {
        return this.displayArray.join(", ");
    }

}