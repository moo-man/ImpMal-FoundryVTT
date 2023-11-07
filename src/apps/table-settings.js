export default class TableSettings extends FormApplication 
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.title = game.i18n.localize("IMPMAL.TableSettings");
        options.classes = options.classes.concat(["impmal", "table-settings"]);
        options.resizable = true;
        return options;
    }

    get template() 
    {
        return `systems/impmal/templates/apps/table-settings.hbs`;
    }

    async getData() 
    {
        let data = await super.getData();
        data.tableSettings = game.settings.get("impmal", "tableSettings");
        data.tables = game.tables.contents;
        return data;
    }

    _updateObject(ev, formData) 
    {
        game.settings.set("impmal", "tableSettings", formData);
    }
}