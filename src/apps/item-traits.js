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
        if (["weapon", "protection", "ammo", "trait"].includes(this.object.type))
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

        let path = this.object.type == "trait" ? "system.attack.traits.list" : "system.traits.list";
        this.object.update({[`${path}`] : traits});
    }

    formatTraits(traits) 
    {
        return Object.keys(foundry.utils.deepClone(traits)).map(key => 
        {
            // Use original to prevent ammo/mods from showing their modifications
            let trait = this.object.type == "trait" ? this.object.system.attack.traits.original.has(key) : this.object.system.traits.original.has(key);
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