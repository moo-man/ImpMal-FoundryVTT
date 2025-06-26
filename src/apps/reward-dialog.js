export default class RewardDialog extends WHFormApplication
{

    static DEFAULT_OPTIONS = {
        classes: ["reward-dialog", "impmal"],
        tag : "form",
        form : {
            handler : this.submit,
            submitOnChange : false,
            closeOnSubmit : true,
        },
        window: {
            resizable : true,
            title : "IMPMAL.Reward",
        },
        position : {
            width: 500
        },
        actions : {
            clickItem : {buttons : [0, 2], handler: this._onClickItem}
        }
    };

    static PARTS = {
        form: {
            template: "systems/impmal/templates/apps/reward-dialog.hbs",
            classes : ["standard-form"]
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    constructor(data, options)
    {
        super(null, options);
        this.data = data;
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.xp = this.data.xp;
        context.solars = this.data.solars;
        context.reason = this.data.reason;
        return context;
    }

    static async submit(event, form, formData)
    {
        if (this.options.resolve)
        {
            this.options.resolve(formData.object);
        }
        return formData.object;
    }

    static async prompt({xp, solars, reason}={})
    {
        return new Promise((resolve) => 
        {
            new this({xp, reason, solars}, {resolve}).render(true);
        });
    }
}