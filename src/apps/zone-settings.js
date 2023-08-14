export default class ZoneSettings extends FormApplication
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "zone-settings"]);
        options.title = game.i18n.localize("IMPMAL.ZoneSettings");
        options.width = 300;
        options.height = 300;
        options.resizable = true;
        options.template = "systems/impmal/templates/apps/zone-settings.hbs";
        return options;
    }


    _updateObject(event, formData)
    {
        return this.object.update(formData);
    }

    static _addZoneConfig(html, drawing)
    {
        let button = $(`<div class="control-icon"><i class="fa-regular fa-gear"></i></div>`);
        button.on("click", () => 
        {
            new this(drawing).render(true);
        });
        html.find(".col.right").append(button);
    }
}