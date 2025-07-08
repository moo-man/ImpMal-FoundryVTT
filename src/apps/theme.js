let fields = foundry.data.fields;

export default class IMThemeConfig extends HandlebarsApplicationMixin(ApplicationV2)
{
  static DEFAULT_OPTIONS = {
    id: "theme-config",
    tag: "form",
    window: {
      title: "WH.Theme.Config",
      contentClasses: ["standard-form"]
    },
    form: {
      closeOnSubmit: true,
      handler: this.onSubmit
    },
    position: { width: 540 },
    actions: {
      reset: this.onReset
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/impmal/templates/apps/theme-config.hbs",
      scrollable: [""]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  };

  static get schema() {
    return IMThemeConfig.#schema;
  }

  static #schema = new foundry.data.fields.SchemaField({

    enabled: new foundry.data.fields.BooleanField({ initial: true },  {label : "Enabled"}),
    font: new foundry.data.fields.StringField({ required: true, initial: "classic", choices: { "classic": "WH.Theme.Font.Classic", "readable": "WH.Theme.Font.Readable" }},  {label : "Font"}),
    scan: new foundry.data.fields.BooleanField({ required: true, initial: true}, {label : "Scan Effect"})


    // actor: new foundry.data.fields.SchemaField({
    //   enabled: new foundry.data.fields.BooleanField({ initial: true }),
    //   font: new foundry.data.fields.StringField({ required: true, initial: "classic", choices: { "classic": "WH.Theme.Font.Classic", "readable": "WH.Theme.Font.Readable" } })
    // }),
    // item: new foundry.data.fields.SchemaField({
    //   enabled: new foundry.data.fields.BooleanField({ initial: true }),
    //   font: new foundry.data.fields.StringField({ required: true, initial: "classic", choices: { "classic": "WH.Theme.Font.Classic", "readable": "WH.Theme.Font.Readable" } })
    // }),
    // journal: new foundry.data.fields.SchemaField({
    //   enabled: new foundry.data.fields.BooleanField({ initial: true }),
    //   font: new foundry.data.fields.StringField({ required: true, initial: "classic", choices: { "classic": "WH.Theme.Font.Classic", "readable": "WH.Theme.Font.Readable" } })
    // }),
    // sidebar: new foundry.data.fields.SchemaField({
    //   enabled: new foundry.data.fields.BooleanField({ initial: true }),
    //   font: new foundry.data.fields.StringField({ required: true, initial: "classic", choices: { "classic": "WH.Theme.Font.Classic", "readable": "WH.Theme.Font.Readable" } })
    // }),
    // apps: new foundry.data.fields.SchemaField({
    //   enabled: new foundry.data.fields.BooleanField({ initial: true }),
    //   font: new foundry.data.fields.StringField({ required: true, initial: "classic", choices: { "classic": "WH.Theme.Font.Classic", "readable": "WH.Theme.Font.Readable" } })
    // }),

  });

  /**
   * The current setting value
   * @type {GameUIConfiguration}
   */
  #setting;

  /**
   * Track whether the schema has already been localized.
   * @type {boolean}
   */
  static #localized = false;

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preFirstRender(_context, _options) {
    await super._preFirstRender(_context, _options);
    if (!IMThemeConfig.#localized) {
      foundry.helpers.Localization.localizeDataModel({ schema: IMThemeConfig.#schema }, {
        prefixes: ["WH.Theme"],
          prefixPath: "impmal.theme."
      });
      IMThemeConfig.#localized = true;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    if (options.isFirstRender) this.#setting = await game.settings.get("impmal", "theme");
    return {
      setting: this.#setting,
      fields: IMThemeConfig.#schema.fields,
      buttons: [
        { type: "reset", label: "Reset", icon: "fa-solid fa-undo", action: "reset" },
        { type: "submit", label: "Save Changes", icon: "fa-solid fa-save" }
      ]
    };
  }

  _onChangeForm(_formConfig, _event) {
    const formData = new foundry.applications.ux.FormDataExtended(this.form);
    this.#setting = IMThemeConfig.#cleanFormData(formData);
    this._setTheme();
    this.render();
  }

  /** @inheritDoc */
  _onClose(options) {
    super._onClose(options);
    if (!options.submitted) game.configureUI(this.#setting);
  }

  _setTheme()
  {
    this.constructor.setTheme(this.#setting);
  }

  static setTheme(setting=game.settings.get("impmal", "theme"))
  {
    if (setting.enabled)
    {
      document.body.classList.add("impmal-theme");
      if (setting.font == "classic")
      {
        document.body.classList.add("impmal-font");
      }
      else 
      {
        document.body.classList.remove("impmal-font");
      }

      if (setting.scan)
      {
        document.body.classList.add("impmal-scan");
      }
      else 
      {
        document.body.classList.remove("impmal-scan");
      }
    }
    else document.body.classList.remove("impmal-theme", "impmal-font")

    // if (setting.actor.enabled)
    // {
    //   document.body.classList.add("theme-actor");
    //   if (setting.actor.font == "classic")
    //   {
    //     document.body.classList.add("actor-font");
    //   }
    // }
    // else document.body.classList.remove("theme-actor", "actor-font")

    // if (setting.item.enabled)
    // {
    //   document.body.classList.add("theme-item");
    //   if (setting.actor.font == "classic")
    //   {
    //     document.body.classList.add("item-font");
    //   }
    // }
    // else document.body.classList.remove("theme-item", "item-font")

    // if (setting.journal.enabled)
    //   {
    //     document.body.classList.add("theme-journal");
    //     if (setting.actor.font == "classic")
    //     {
    //       document.body.classList.add("journal-font");
    //     }
    //   }
    //   else document.body.classList.remove("theme-journal", "journal-font")

    // if (setting.sidebar.enabled)
    // {
    //   document.body.classList.add("theme-sidebar");
    //   if (setting.actor.font == "classic")
    //   {
    //     document.body.classList.add("sidebar-font");
    //   }
    // }
    // else document.body.classList.remove("theme-sidebar", "sidebar-font")
  }

  setThemeOnElement(element, theme)
  {
    if (theme.enabled)
    {
      element.classList.remove("no-theme")

      if (theme.font == "classic")
      {
        element.classList.add("classic-font")
      }
      else
      {
        element.classList.remove("classic-font")
      }
    }
    else
    {
      element.classList.add("no-theme")
      element.classList.remove("classic-font")
    }
  }

  /**
   * Clean the form data, accounting for the field names assigned by game.settings.register on the schema.
   * @param {FormDataExtended} formData
   * @returns {GameUIConfiguration}
   */
  static #cleanFormData(formData) {
    return IMThemeConfig.#schema.clean(foundry.utils.expandObject(formData.object).impmal.theme);
  }

  /**
   * Submit the configuration form.
   * @this {UIConfig}
   * @param {SubmitEvent} event
   * @param {HTMLFormElement} form
   * @param {FormDataExtended} formData
   * @returns {Promise<void>}
   */
  static async onSubmit(event, form, formData) {
    await game.settings.set("impmal", "theme", this.#setting);
  }
}