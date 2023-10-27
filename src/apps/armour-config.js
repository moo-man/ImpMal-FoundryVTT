export default class ArmourConfig extends FormApplication 
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.title = game.i18n.localize("IMPMAL.ArmourConfig");
        options.classes = options.classes.concat(["impmal", "armour-config"]);
        options.resizable = true;
        return options;
    }

    get template() 
    {
        return `systems/impmal/templates/apps/armour-config.hbs`;
    }

    async getData() 
    {
        let data = await super.getData();
        return data;
    }

    _updateObject(ev, formData) 
    {
        this.object.update(formData);
    }

    activateListeners(html)
    {
        super.activateListeners(html);

        let armourFields = html.find(".armour-fields")[0];

        html.find(".use-items").click(ev => 
        {
            if (ev.currentTarget.checked)
            {
                armourFields.classList.add("disabled", "inactive");
            }
            else 
            {
                armourFields.classList.remove("disabled", "inactive");
            }
        });
    }
}