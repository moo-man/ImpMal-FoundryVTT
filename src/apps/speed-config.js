export class SpeedConfigForm extends HandlebarsApplicationMixin(ApplicationV2)
{
    static DEFAULT_OPTIONS = {
        tag : "form",
        window : {
            title : "IMPMAL.SpeedConfig.Title"
        },
        position : {
            width: 300
        },
        form: {
            handler: this.submit,
            submitOnChange: false,
            closeOnSubmit: true
        }
    };

    static PARTS = {
        form: {
            template: "systems/impmal/templates/apps/speed-config.hbs"
        }
    };

    constructor(document, options)
    {
        super(options);
        this.document = document;
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.system = this.document.system;
        return context;
    }

    static async submit(event, form, formData)
    {
        this.document.update(formData.object);
    }
}