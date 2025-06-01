export default class ItemTraitsForm extends WHFormApplication 
{
    static DEFAULT_OPTIONS = {
        tag : "form",
        classes : ["impmal", "item-traits"],
        window : {
            title : "IMPMAL.Traits",
            resizable : true
        },
        position : {
            height: 600,
        },
        form: {
            handler: this.submit,
        }
    }

    static PARTS = {

        form: {
            template: "systems/impmal/templates/apps/item-traits.hbs",
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    }

    constructor(document, options)
    {
        options.path = options?.path || (document.type == "trait" ? "system.attack.traits" : "system.traits");
        super(document, options);
        
    }

    async _prepareContext(options) 
    {
        let context = await super._prepareContext(options);

        context.itemTraits = this.formatTraits(game.impmal.config.itemTraits);
        if (["weapon", "protection", "ammo", "trait", "modification"].includes(this.document.type))
        {
            context.weaponArmourTraits = this.formatTraits(game.impmal.config.weaponArmourTraits);
        }
        return context;
    }

    static async submit (ev, form, formData) 
    {
        let traits = [];

        for(let key in formData.object)
        {
            if (formData.object[key])
            {
                let trait = {};
                if (game.impmal.config.itemTraits[key] || game.impmal.config.weaponArmourTraits[key])
                {
                    trait.key = key;
                    trait.value = formData.object[key + "-value"];
                    traits.push(trait);
                }
            }
        }

        this.document.update({[`${this.options.path}.list`] : traits});
    }

    formatTraits(traits) 
    {
        return Object.keys(foundry.utils.deepClone(traits)).map(key => 
        {
            // Use original to prevent ammo/mods from showing their modifications
            let trait = foundry.utils.getProperty(this.document, this.options.path)?.original.has(key);
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