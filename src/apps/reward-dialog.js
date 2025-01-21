export default class RewardDialog extends HandlebarsApplicationMixin(ApplicationV2) 
{

    static DEFAULT_OPTIONS = {
        classes: ["reward-dialog", "warhammer", "impmal"],
        tag : "form",
        form : {
            handler : this.submit,
            submitOnChange : false,
            closeOnSubmit : true
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
            template: "systems/impmal/templates/apps/reward-dialog.hbs"
        }
    };

    constructor(data, options)
    {
        super(options);
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