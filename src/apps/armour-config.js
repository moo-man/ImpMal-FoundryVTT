export default class ArmourConfig extends WHFormApplication
{
    static DEFAULT_OPTIONS = {
        tag : "form",
        classes : ["impmal", "warhammer"],
        window : {
            title : "IMPMAL.ArmourConfig",
        },
        form: {
            handler: this.submit,
            submitOnChange: true,
            closeOnSubmit: false
        }
    };

    static PARTS = {
        form: {
            template: "systems/impmal/templates/apps/armour-config.hbs",
        }
    };
    
    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.values = this.document.system.combat.armour;
        context.fields = this.document.system.schema.fields.combat.fields.armour.fields;
        context.damageValues = this.document.system.combat.armour.damage;
        context.damages = this.document.system.schema.fields.combat.fields.armour.fields.damage.fields;
        return context;
    }

    static async submit(ev, form, formData)
    {
        await super.submit(ev, form, formData)
        this.render(true);
    }
}