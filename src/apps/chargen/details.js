import { ChargenStage } from "./stage";

export class DetailsStage extends ChargenStage {
  journalId = "Compendium.impmal-core.journals.JournalEntry.IQ0PgoJihQltCBUU.JournalEntryPage.Q4C9uANCqPzlRKFD"
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.resizable = true;
    options.width = 500;
    options.classes.push("details");
    options.minimizable = true;
    options.title = game.i18n.localize("IMPMAL.CHARGEN.StageTitle.Details");
    return options;
  }

  static get title() { return game.i18n.localize("IMPMAL.CHARGEN.StageTitle.Details"); }

  get template() {
    return "systems/impmal/templates/apps/chargen/details.hbs";
  }

  TABLES = {
    rollName :["ZqI4aqwNimSIvn0u", "LQQSVSJW5j8d87MJ", "l3wReEEnU5MMjiMR", "4fSZRyUTFHNuCHiB", "coJHDTpSkUfDMXAJ"],
    rollAge :[],
    rollHeight :[],
    rollEyes :["X0ki23WlGEfkxMYI"],
    rollHairColour :["kwryVvk6y1FeCCmG"],
    rollHairStyle :["BOxQIj5TwduOo1Bk"],
    rollConnections :["r1enfoBH64ajVnBa"],
    rollFeature : ["yNzbUdTn7e4psIZW"]
  }

  constructor(...args) {
    super(...args);
    this.context = {};
    this.context.connections = [];
  }

  async getData() {
    let data = await super.getData();
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".roll-details").click(async (ev) => {
      let type = ev.currentTarget.dataset.type;
      let key = ev.currentTarget.parentElement.querySelector("input").name
      if (this[type])
      {
        await this[type]();
      }
      else if (this.TABLES[type].length)
      {
        let tables = await Promise.all(this.TABLES[type].map(game.impmal.utility.findId))
        let choice = await ItemDialog.create(tables, 1, {title : "Choose Table", text : "Choose a Table to roll on", skipSingularItemPrompt : true});
        if (choice[0])
        {
          let result = await choice[0].roll();
        if (type == "rollConnections")
        {
          this.context.connections.push(result.results[0].text)
        }
        else
        {
          this.context[key] = result.results[0].text;
        }
        }
      }
      this.render(true);

    });

    html.find("input[name],textarea").change(ev => {
      this.context[ev.target.name] = ev.target.value;
    });

    html.find(".connections input").change(ev => {

        if (!ev.target.value)
        {
          this.context.connections = this.context.connections.filter((_, index) => index != Number(ev.target.parentElement.dataset.index));
        }
        else if (ev.target.parentElement.dataset.index)
        {
          this.context.connections[0] = ev.target.value;
        }
        else 
        {
          this.context.connections.push(ev.target.value);
        }
        this.render(true)
    })
  }

  _updateObject(ev, formData) {
    this.data.details.name = formData.name;
    this.data.details.gender = formData.gender;
    this.data.details.age = formData.age;
    this.data.details.height = formData.height;
    this.data.details.eyes = formData.eyes;
    this.data.details.hair = formData.hairColour + " " + formData.hairStyle;
    this.data.details.feature = formData.feature;
    this.data.details.short = formData.short;
    this.data.details.long = formData.long;
    this.data.details.connections = this.context.connections;
    super._updateObject(ev, formData)
  }

  async rollAge() {
    let bracket = (await ItemDialog.create(ItemDialog.objectToArray(game.impmal.config.age, null, "name")))[0]?.id;
    let data = game.impmal.config.age[bracket];
    if (data)
    {
      this.context.age = (await new Roll(data.formula).roll()).total;
    }
  }

  async rollHeight() {
    let heightRoll = (await new Roll("2d10").roll()).total;
    let inches = (4 * 12) + 9 + heightRoll;
    let feet = Math.floor(inches / 12);
    inches = inches % 12
    this.context.height = `${feet}'${inches}`;
  }
}
