export default class ItemTraitsForm extends FormApplication 
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "item-traits"]);
        options.resizable = true;
        return options;
    }

    get template() 
    {
        return `systems/impmal/templates/apps/item-traits.hbs`;
    }

    async getData() 
    {
        let data = await super.getData();

        data.itemTraits = this.formatTraits(game.impmal.config.itemTraits);
        if (["weapon", "protection"].includes(this.object.type))
        {
            data.weaponArmourTraits = this.formatTraits(game.impmal.config.weaponArmourTraits);
        }
        return data;
    }

    _updateObject(ev, formData) 
    {
        let traits = [];

        for(let key in formData)
        {
            if (formData[key])
            {
                let trait = {};
                if (game.impmal.config.itemTraits[key] || game.impmal.config.weaponArmourTraits[key])
                {
                    trait.key = key;
                    trait.value = formData[key + "-value"];
                    traits.push(trait);
                }
            }
        }

        this.object.update({"system.traits.list" : traits});
    }

    formatTraits(traits) 
    {
        return Object.keys(foundry.utils.deepClone(traits)).map(key => 
        {
            let trait = this.object.system.traits.has(key);
            if (trait) 
            {
                trait.existing = true;
            }
            else 
            {
                trait = { key, value: null, existing: false };
            }
            trait.name = traits[key];
            return trait;
        });
    }



}