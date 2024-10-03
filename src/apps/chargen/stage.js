export class ChargenStage extends FormApplication {
  active = false;
  html = "";
  data = {};
  context = {};
  journalId = ""

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.resizable = true;
    options.id = "chargen-stage";
    options.classes = options.classes.concat("impmal", "chargen-stage");
    options.width = 1000;
    options.height = 600;
    options.minimizable = true;
    options.title = game.i18n.localize("IMPMAL.CHARGEN.Title");
    options.scrollY = [".stage-content"]
    options.cannotResubmit = false;
    return options;
  }

  
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
      buttons.unshift(
        {
          class: "help",
          icon: "fa-solid fa-circle-question",
          onclick: async ev => this.renderJournalPage()
        })
    return buttons
  }

  async renderJournalPage()
  {
    let journalPage = await fromUuid(this.journalId)

    if (journalPage)
    {
      await journalPage.parent.sheet._render(true)
      journalPage.parent.sheet.goToPage(journalPage.id)
    }
  }

  constructor(object, options) {
    super(object, options);
    this.data = object;
  }

  async getData() {
    return { data: this.data, context: this.context };
  }

  async validate() {

    let valid = !this.options.cannotResubmit || !this.options.isCompleted 
    if (!valid)
    {
      this.showError("StageAlreadySubmitted")
    }
    return valid
  }

  showError(key, args)
  {
    ui.notifications.error(game.i18n.format("IMPMAL.CHARGEN.ERROR." + key, args))
  }


  updateMessage(key, args={}, string = null)
  {
    args.user = game.user.name
    if (this.options.message)
    {
      let content = this.options.message.content

      if (string)
        content += string
      else
        content += game.i18n.format("IMPMAL.CHARGEN.Message." + key, args)

     return this.options.message.update({content})
    }

  }



  // HTML to add to the char gen application
  async addToDisplay() {
    return null
  }

  static stageData() 
  {
    return {
      class: this,
      key: "stage",
      title: null,
      dependantOn: [],
      app: null,
      complete: false
    }
  }

  _updateObject(event, formData) {
    this.options.complete(this.options.index);
  }

   async _onSubmit(...args) {
    args[0].preventDefault();
    if (await this.validate())
    {
      this.options.isCompleted = true;
      super._onSubmit(...args)
    }
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.on("click", '[data-action]', this.onButtonClick.bind(this));

    // Autoselect entire text 
    html.find("input").on("focusin", ev => {
      ev.target.select();
    });
  }


  onButtonClick(ev) {
    let type = ev.currentTarget.dataset.action;
    if (typeof this[type] == "function") {
      this[type](ev);
    }
  }
}
