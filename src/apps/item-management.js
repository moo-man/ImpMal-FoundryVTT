import ImpMalSheetMixin from "../sheet/mixins/sheet-mixin";

export class ItemManagementForm extends ImpMalSheetMixin(FormApplication)
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "item-management"]);
        options.title = game.i18n.localize("IMPMAL.ManageItems");
        options.resizable = true;
        options.template = "systems/impmal/templates/apps/item-management.hbs";
        return options;
    }

    _updateObject()
    {
        return; // Form does not submit, each deletion updates the actor
    }

    activateListeners(html)
    {
        super.activateListeners(html);

        html.find(".list-delete").click(async ev => 
        {
            await this._onListDelete(ev, true);
            this.render(true);
        });
        html.find(".list-edit").click(this._onListEdit.bind(this));
    }
}
