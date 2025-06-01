export class ActorConfigForm extends WHFormApplication
{
    static DEFAULT_OPTIONS = {
        classes : ["impmal"],
        window : {
            title : "IMPMAL.ActorConfig.Title"
        },
        position : {
            width: 600
        }
    };

    static PARTS = {
        form: {
            template: "modules/warhammer-lib/templates/apps/generic-form.hbs"
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.values = this.document.system.autoCalc;
        context.fields = this.document.system.schema.fields.autoCalc.fields;
        return context;
    }
}