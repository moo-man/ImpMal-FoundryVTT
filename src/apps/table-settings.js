export default class TableSettings extends HandlebarsApplicationMixin(ApplicationV2)
{
    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["impmal","warhammer", "table-settings"],
        window: {
            title: "IMPMAL.TableSettings",
            contentClasses : ["standard-form"],
            resizable : true,
        },
        position : {
            width: 400
        },
        form: {
            submitOnChange: false,
            closeOnSubmit : true,
            handler: this.submit
        },
        actions : {
            reset : this._onReset
        }
    }

    /** @override */
    static PARTS = {
        form: {
            template: "systems/impmal/templates/apps/table-settings.hbs",
            scrollable: [""]
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    static #schema = new foundry.data.fields.SchemaField({
        critarm : new foundry.data.fields.StringField({initial : "7PZdfk0TRBPDr0QR", label : "IMPMAL.TableSetting.critarm"}),
        critleg : new foundry.data.fields.StringField({initial : "2GOSTiyV8FH51YD2", label : "IMPMAL.TableSetting.critleg"}),
        crithead : new foundry.data.fields.StringField({initial : "dvsiB3K8ezHI8F7M", label : "IMPMAL.TableSetting.crithead"}),
        critbody : new foundry.data.fields.StringField({initial : "kCP63j7ZWPVquLqW", label : "IMPMAL.TableSetting.critbody"}),
        critwheeled : new foundry.data.fields.StringField({initial : "eK59j07kMGsBrPn3", label : "IMPMAL.TableSetting.critwheeled"}),
        critwalker : new foundry.data.fields.StringField({initial : "LEuY8VGMAoJxnHG4", label : "IMPMAL.TableSetting.critwalker"}),
        critflyer : new foundry.data.fields.StringField({initial : "kIylBB1FNj2A4wvY", label : "IMPMAL.TableSetting.critflyer"}),
        crittracked : new foundry.data.fields.StringField({initial : "TnG7dMYjAL7WaFXp", label : "IMPMAL.TableSetting.crittracked"}),
        critvehicle : new foundry.data.fields.StringField({initial : "wyIDvsnkkI18FbJy", label : "IMPMAL.TableSetting.critvehicle"}),
        fumble : new foundry.data.fields.StringField({initial : "HL6DtTGWIUQy5NZ9", label : "IMPMAL.TableSetting.fumble"}),
        perils : new foundry.data.fields.StringField({initial : "2YYlAUyaVIt4bZVa", label : "IMPMAL.TableSetting.perils"}),
        phenomena : new foundry.data.fields.StringField({initial : "9aSbu2mswOOI43J1", label : "IMPMAL.TableSetting.phenomena"}),
        talents : new foundry.data.fields.StringField({initial : "9SLhM8FOgluaUwvO", label : "IMPMAL.TableSetting.talents"}),
        origin : new foundry.data.fields.StringField({initial : "nyaEnNOrR8Sq8Wf4", label : "IMPMAL.TableSetting.origin"}),
        mutation : new foundry.data.fields.StringField({initial : "aHz4wSCM8ogTVOhT", label : "IMPMAL.TableSetting.mutation"}),
        malignancy : new foundry.data.fields.StringField({initial : "AJC7cYdzY3rIHZWm", label : "IMPMAL.TableSetting.malignancy"})
    })

    static get schema()
    {
        Hooks.call("impmal.tableSettingSchema", this.#schema)
        return this.#schema
    }

    async _prepareContext(options) {
        let context = await super._prepareContext(options);
        context.settings = game.settings.get("impmal", "tableSettings");
        context.schema = this.constructor.schema;
        context.tables = game.tables.contents.reduce((tables, t) => {tables[t._id] = t.name; return tables}, {});
        context.buttons = [
            {
              type: "button",
              icon: "fa-solid fa-arrow-rotate-left",
              label: "Reset",
              action: "reset"
            },
            {type: "submit", icon: "fa-solid fa-floppy-disk", label: "SETTINGS.Save"}]
        return context
    }


    static async submit(event, form, formData) {
        return game.settings.set("impmal", "tableSettings", formData.object)
    }

    static async _onReset(ev, target)
    {
        let defaults = {};

        for(let setting in this.constructor.schema.fields)
        {
            defaults[setting] = this.constructor.schema.fields[setting].initial;
        }

        await game.settings.set("impmal", "tableSettings", defaults)
        this.render(true);
    }

}