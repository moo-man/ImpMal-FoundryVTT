export default class ZoneSettings extends FormApplication
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "zone-settings"]);
        options.title = game.i18n.localize("IMPMAL.ZoneSettings");
        options.width = 300;
        options.height = "auto";
        options.resizable = true;
        options.template = "systems/impmal/templates/apps/zone-settings.hbs";
        options.tabs = [{navSelector: ".tabs", contentSelector: ".content", initial: "traits"}];
        return options;
    }


    _updateObject(event, formData)
    {
        return this.object.update(formData);
    }

    async getData()
    {
        let data = await super.getData();
        data.basePath = this.object.documentName == "ActiveEffect" ? "flags.impmal.applicationData.traits" : "flags.impmal.traits";
        data.traits = getProperty(this.object, data.basePath);
        return data;
    }


    activateListeners(html)
    {
        super.activateListeners(html);

        html.find(".list-delete").click(ev => 
        {
            let index = $(ev.currentTarget).parents("[data-index]").attr("data-index");
            let effects = foundry.utils.deepClone(this.object.flags.impmal.effects);
            effects.splice(index, 1);
            this.object.setFlag("impmal", "effects", effects).then(() => this.render(true));
        });
    }

    static _addZoneConfig(html, drawing)
    {
        let button = $(`<div class="control-icon"><i class="fa-regular fa-game-board-simple"></i></div>`);
        button.on("click", () => 
        {
            new this(drawing).render(true);
        });
        html.find(".col.right").append(button);
    }
}