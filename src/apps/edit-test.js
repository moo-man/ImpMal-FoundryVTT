export class EditTestForm extends FormApplication
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "edit-test"]);
        options.title = game.i18n.localize("IMPMAL.EditTest");
        options.resizable = true;
        options.template = "systems/impmal/templates/apps/edit-test.hbs";
        return options;
    }


    getData() 
    {
        let data = super.getData();
        data.result = this.object.data.result;
        return data;
    }


    _updateObject(ev, formData)
    {
        foundry.utils.mergeObject(this.object.data.result, formData);
        this.object.roll();
    }

}