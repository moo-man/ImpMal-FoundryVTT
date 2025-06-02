export default class EditTestForm extends WHFormApplication {
    static DEFAULT_OPTIONS = {
        tag : "form",
        classes : ["impmal", "edit-test"],
        window : {
            title: "IMPMAL.EditTest",
            contentClasses: ["standard-form"],
        },
        form: {
            handler: this.submit,
        }
    }

    static PARTS = {

        form: {
            template: "systems/impmal/templates/apps/edit-test.hbs",
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    }
    
    constructor(test, options)
    {
        super(options);
        this.test = test;
    }


    async _prepareContext() 
    {
        let context = await super._prepareContext();
        context.result = this.test.data.result;
        return context;
    }


    static async submit(ev, form, formData)
    {
        // `data.result` allows us to set a value instead of determining it. i.e. `data.result.roll` is used instead of `data.roll` if it exists
        foundry.utils.mergeObject(this.test.data.result, formData.object);

        // State needs to be added directly to the test data
        this.test.data.state = formData.object.state;
        this.test.roll();
    }
}