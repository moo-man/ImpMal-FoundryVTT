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

    /**
     * 
     * 
     * @param {String} trait Trait Key
     * @param {Object} modify Whether to modify the data directly or return the modification to update   
     * @returns 
     */
    add(trait, {value=1, modify=false}={})
    {

        if (modify)
        {

            let existing = this.has(trait);
            if (existing)
            {
                if (existing.value)
                {
                    if (isNaN(existing.value))
                    {
                        existing.value += `, ${value}`
                    }
                    else 
                    {
                        existing.value = parseInt(existing.value) + value;
                    }
                }
            }
            else 
            {
                let newTrait = {key: trait};
                if (game.impmal.config.traitHasValue[trait])
                {
                    newTrait.value = value;
                }
                this.list.push(newTrait);
            }
        }
        else 
        {
            let list = foundry.utils.deepClone(this.list);
            let existing = list.find(i => i.key == trait);
            if (existing && existing.value)
            {
                existing.value++;
            }
            else if (!existing)
            {
                let newTrait = {key: trait};
                if (game.impmal.config.traitHasValue[trait])
                {
                    newTrait.value = 1;
                }
                list.push(newTrait);
            }
            return list;
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

    // Remove traits from list list as specified by the input traits
    remove(traits)
    {
        for(let trait of traits.list)
        {
            let existing = this.has(trait.key);
            if (existing)
            {
                if (Number.isNumeric(existing.value) && Number.isNumeric(trait.value))
                {
                    existing.value = Number(existing.value) - Number(trait.value);
                }
                else 
                {
                    this.list = this.list.filter(i => i.key != trait.key);
                }
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
                if (i.value) 
                {
                    display += ` (${i.value})`;
                }
                return `<a data-key=${i.key} data-value=${i.value}>${display}</a>`;
            });
    }

    get displayString() 
    {
        return this.displayArray.join(", ");
    }

    traitEffects(type)
    {
        return this.list.reduce((obj, t) => 
        {
            let effectData = type == "weapon" ? game.impmal.config.weaponTraitEffects[t.key] : game.impmal.config.protectionTraitEffects[t.key];
            if (effectData)
            {
                let effect = new ActiveEffect.implementation(effectData, {parent: this.parent.parent});
                effect.updateSource({img : this.parent.parent.img, "flags.impmal.path" : `${this.schema.fieldPath}.effects.${t.key}`})
                obj[t.key] = effect
            }
            return obj;
        }, {})
    }

}