export class ActorConfigForm extends HandlebarsApplicationMixin(ApplicationV2)
{
    static DEFAULT_OPTIONS = {
        tag : "form",
        window : {
            title : "IMPMAL.ActorConfig.Title"
        },
        position : {
            width: 600
        },
        form: {
            handler: this.submit,
            submitOnChange: false,
            closeOnSubmit: true
        }
    };

    static PARTS = {
        form: {
            template: "modules/warhammer-lib/templates/apps/generic-form.hbs"
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
        context.values = this.document.system.autoCalc;
        context.fields = this.document.system.schema.fields.autoCalc.fields;
        return context;
    }

    static async submit(event, form, formData)
    {
        this.document.update(formData.object);
    }
}