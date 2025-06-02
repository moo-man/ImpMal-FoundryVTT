export class SpeedConfigForm extends WHFormApplication
{
    static DEFAULT_OPTIONS = {
        window : {
            title : "IMPMAL.SpeedConfig.Title"
        },
        position : {
            width: 300
        }
    };

    static PARTS = {
        form: {
            template: "systems/impmal/templates/apps/speed-config.hbs"
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.system = this.document.system;
        return context;
    }
}