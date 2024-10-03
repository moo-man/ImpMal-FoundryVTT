import { DetailsStage } from "./details";
import { CharacteristicsStage } from "./characteristics";
import { FactionStage } from "./faction";
import { RoleStage } from "./role";
import { OriginStage } from "./origin";

/**
 * This class is the center of character generation through the chat prompts
 */
export default class CharGenIM extends FormApplication {
  constructor(existing={}, options) {
    super(null, options);
    this.data = existing?.createData || {
      exp: {
        characteristics: 0,
        origin: 0,
        faction: 0,
        role: 0
      },
      items: {},
      choices : {

      },
      skillAdvances: {

      },
      characteristics: {
        ws: {starting: 0, advances : 0},
        bs: {starting: 0, advances : 0},
        str: {starting: 0, advances : 0},
        tgh: {starting: 0, advances : 0},
        ag: {starting: 0, advances : 0},
        int: {starting: 0, advances : 0},
        per: {starting: 0, advances : 0},
        wil: {starting: 0, advances : 0},
        fel: {starting: 0, advances : 0}
      },
      skills: {
        athletics : 0,
        awareness : 0,
        dexterity : 0,
        discipline : 0,
        fortitude : 0,
        intuition : 0,
        linguistics : 0,
        logic : 0,
        lore : 0,
        medicae : 0,
        melee : 0,
        navigation : 0,
        piloting : 0,
        presence : 0,
        psychic : 0,
        ranged : 0,
        rapport : 0,
        reflexes : 0,
        stealth : 0,
        tech : 0
      },
      handed : "right",
      
      details : {
        age: 0,
        feature: "",
        eyes: "",
        hair: "",
        height: "",
        weight: "",
        divination: "",
        species : ""
      },
      misc : {
        // Object for stages to add whatever data they wish to be merged into actor data
      }
    }
    this.stages = [
      {
        class: CharacteristicsStage,
        key: "characteristics",
        dependantOn: [],
        app: null,
        complete: false
      },
      {
        class: OriginStage,
        key: "origin",
        dependantOn: ["characteristics"],
        app: null,
        complete: false
      },
      {
        class: FactionStage,
        key: "faction",
        dependantOn: ["origin"],
        app: null,
        complete: false
      },
      {
        class: RoleStage,
        key: "role",
        dependantOn: ["faction"],
        app: null,
        complete: false
      },
      {
        class: DetailsStage,
        app: null,
        key: "details",
        dependantOn: [],
        complete: false
      }
    ]

    // If using existing data, record which stages were already complete
    if (existing?.stages)
    {
      for(let existingStage of existing.stages)
      {
        let stage = this.stages.find(s => s.key == existingStage.key)
        if (stage)
        {
          stage.complete = existingStage.complete;
        }
      }
    }

    this.actor = {type: "character", system: foundry.utils.deepClone(game.system.model.Actor.character), items: [] }

    if (!game.user.isGM)
    {
      ChatMessage.create({content : game.i18n.format("IMPMAL.CHARGEN.Message.Start", {user : game.user.name})}).then(msg => this.message = msg)
    }

    // Warn user if they won't be able to create a character
    if (!game.user.isGM && !game.settings.get("core", "permissions").ACTOR_CREATE.includes(game.user.role) && !game.users.find(u => u.isGM && u.active))
    {
      ui.notifications.warn(game.i18n.localize("IMPMAL.CHARGEN.NoGMWarning"), {permanent : true})
    }


    Hooks.call("impmal:chargen", this)
  }


  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "chargen";
    options.template = "systems/impmal/templates/apps/chargen/chargen.hbs"
    options.classes = options.classes.concat("impmal", "chargen");
    options.resizable = true;
    options.width = 1000;
    options.height = 600;
    options.minimizable = true;
    options.title = game.i18n.localize("IMPMAL.CHARGEN.Title")
    return options;
  }


  async getData() {

    let skills = []


    let allItems = []
    for(let key in this.data.items)
    {
      allItems = allItems.concat(this.data.items[key])
    }


    let allChanges = allItems
    .filter(i => i)
    .reduce((prev, current) => prev.concat(Array.from(current.effects)), []) // reduce items to effects
    .reduce((prev, current) => prev.concat(current.changes), [])      // reduce effects to changes
    .filter(c => c.key.includes("characteristics"))                   // filter changes to characteristics

    let characteristics = duplicate(this.data.characteristics)

    for (let ch in characteristics)
    {
      // Apply modifiers from item effects
      let changes = allChanges.filter(c => c.key.includes(`characteristics.${ch}`))
      let startingChanges = changes.filter(c => c.key.includes(`characteristics.${ch}.starting`))
      let modifierChanges = changes.filter(c => c.key.includes(`characteristics.${ch}.modifier`))

      let startingSum = startingChanges.reduce((prev, current) => prev += Number(current.value), 0)
      let modifierSum = modifierChanges.reduce((prev, current) => prev += Number(current.value), 0)

      characteristics[ch].starting += startingSum
      characteristics[ch].total = characteristics[ch].starting + characteristics[ch].advances + modifierSum
    }



    for(let key in this.data.skillAdvances)
    {
      let skill //= await game.wfrp4e.utility.findSkill(key)
      if (skill)
      {
        let ch = characteristics[skill.system.characteristic.value]
        if (ch && this.data.skillAdvances[key] > 0)
        {
          skills.push(`${key} (+${this.data.skillAdvances[key]}) ${ch.starting + ch.advances + this.data.skillAdvances[key]}`)
        }
      }
    }

    let exp = 0
    for(let key in this.data.exp)
    {
      exp += this.data.exp[key]
    }

    this.stages.forEach(stage => {
      stage.title ??= stage.class.title;
    })

    return {
      stages: this.stages,
      characteristics,
      data : this.data,
      stageHTML :  await this._getStageHTML(),
      skills : skills.join(", "),
      talents : this.data.items.talents?.map(i => i.name).join(", "),
      trappings : this.data.items.trappings?.map(i => i.name).join(", "),
      exp
    }
  }

  static async start()
  {
    let existing = localStorage.getItem("impmal-chargen");
    if (existing)
    {
      let useExisting = await Dialog.wait({
        title : game.i18n.localize("IMPMAL.CHARGEN.UseExistingData"),
        content : game.i18n.localize("IMPMAL.CHARGEN.UseExistingDataContent"),
        buttons : {
          yes : {
            label : game.i18n.localize("Yes"),
            callback : () => {
              return true;
            }
          },
          no : {
            label : game.i18n.localize("No"),
            callback : () => {
              return false
            }
          }
        }
      })

      return new this(useExisting ? JSON.parse(existing) : null).render(true);
    }
    else
    {
      return new this().render(true);
    }
  }

  async _getStageHTML()
  {
    let html = []

    for(let stage of this.stages)
    {
      html.push(await stage.app?.addToDisplay())
    }

    return html.filter(i => i).join("")
  }

  async _updateObject(ev, formData)
  {
    try {

      if (this.message)
        this.message.update({content : this.message.content + game.i18n.format("IMPMAL.CHARGEN.Message.Created", {name : this.data.details.name})})

      this.actor.system.details.species.value = this.data.species
      this.actor.system.details.species.subspecies = this.data.subspecies

      for(let exp in this.data.exp)
      {
        if (Number.isNumeric(this.data.exp[exp]))
          this.actor.system.details.experience.total += Number(this.data.exp[exp])
      }

      for(let key in this.data.items)
      {
        let items = this.data.items[key]
        if (!(items instanceof Array))
        {
          items = [items]
        }
        this.actor.items = this.actor.items.concat(items)
      }

      let money = await WFRP_Utility.allMoneyItems()

      money.forEach(m => m.system.quantity.value = 0)

      this.actor.items = this.actor.items.concat(money)

      // Get basic skills, add advancements (if skill advanced and isn't basic, find and add it)
      let skills = await WFRP_Utility.allBasicSkills();
      for(let skill in this.data.skillAdvances)
      {
        let adv = this.data.skillAdvances[skill]
        if (Number.isNumeric(adv))
        {
          let existing = skills.find(s => s.name == skill)

          if (!existing)
          {
            existing = await WFRP_Utility.findSkill(skill)
            existing = existing.toObject()
            skills.push(existing)
          }
          existing.system.advances.value += Number(adv)
        }
      }
      this.actor.items = this.actor.items.concat(skills);

      mergeObject(this.actor.system.characteristics, this.data.characteristics, {overwrite : true})
      this.actor.system.status.fate.value = this.data.fate.base + this.data.fate.allotted
      this.actor.system.status.resilience.value = this.data.resilience.base + this.data.resilience.allotted

      this.actor.system.status.fortune.value =  this.actor.system.status.fate.value
      this.actor.system.status.resolve.value =  this.actor.system.status.resilience.value

      this.actor.system.details.move.value = this.data.move

      this.actor.name = this.data.details.name || "New Character"
      this.actor.system.details.gender.value = this.data.details.gender
      this.actor.system.details.age.value = this.data.details.age
      this.actor.system.details.height.value = this.data.details.height
      this.actor.system.details.haircolour.value = this.data.details.hair
      this.actor.system.details.eyecolour.value = this.data.details.eyes
      this.actor.system.details.motivation.value = this.data.details.motivation
      this.actor.system.details["personal-ambitions"] = {
        "short-term" : this.data.details.short,
        "long-term" : this.data.details.long
      }

      mergeObject(this.actor, expandObject(this.data.misc), {overwrite : true})


      this.actor.items = this.actor.items.filter(i => {
        if (i.type == "skill")
        {
          // Include any skill with advances
          if (i.system.advances.value > 0)
          {
            return true
          }
          // or include any basic skill that isn't a specialization
          if (i.system.advanced.value == "bsc" && i.system.grouped.value == "noSpec")
          {
            return true;
          }
          // or include any basic skill that IS a specialisation (but not specialised, i.e. Art, or Ride)
          if(i.system.advanced.value == "bsc" && i.system.grouped.value == "isSpec" && !i.name.includes("(") && !i.name.includes(")")) 
          {
            return true
          }
          else return false;
        }
        else // Return true if any other item besides skills
        {
          return true
        };
      })

      if (game.user.isGM || game.settings.get("core", "permissions").ACTOR_CREATE.includes(game.user.role))
      {
        let document = await Actor.create(this.actor);
        document.createEmbeddedDocuments("Item", items);
        document.sheet.render(true);
        localStorage.removeItem("impmal-chargen")
      }
      else {
        // Create temp actor to handle any immediate scripts
        let tempActor = await Actor.create(this.actor, {temporary: true})
        for(let i of tempActor.items.contents)
        {
          await i._preCreate(i._source, {}, game.user.id);
        }
        const payload =  {id : game.user.id, data : tempActor.toObject()}
        let id = await game.impmal.socket.executeOnUserAndWait("GM", "createActor", payload);
        let actor = game.actors.get(id);
        if (actor && actor.isOwner) {
          actor.sheet.render(true)
          localStorage.removeItem("impmal-chargen")
        }
      }
    }
    catch(e)
    {
      ui.notifications.error(game.i18n.format("IMPMAL.CHARGEN.ERROR.Create", {error: e}))
    }
  }

  complete(stageIndex) {
    this.stages[stageIndex].complete = true;
    Hooks.call("impmal:chargenStageCompleted", this, this.stages[stageIndex]);
    localStorage.setItem("impmal-chargen", JSON.stringify({data : this.data, stages : this.stages}));
    this.render(true);
  }

  canStartStage(stage)
  {
    if (!stage)
      return false

    let dependancies = stage.dependantOn.map(i => this.stages.find(s => s.key == i))
    return dependancies.every(stage => stage.complete)

  }

  addStage(stage, index, stageData = {}) {
    let stageObj = stage.stageData();
    stageObj = foundry.utils.mergeObject(stageObj, stageData);

    if (index === undefined) {
      this.stages.push(stageObj)
    } else { // Insert new stage in specified index
      let newStages = this.stages.slice(0, index);
      newStages.push(stageObj);
      newStages = newStages.concat(this.stages.slice(index));
      this.stages = newStages;
    }
  }


  activateListeners(html) {
    super.activateListeners(html);

    html.find(".chargen-button").on("click", ev => {
      let stage = this.stages[Number(ev.currentTarget.dataset.stage)]

      if (!this.canStartStage(stage))
      {
        return ui.notifications.error(game.i18n.format("IMPMAL.CHARGEN.ERROR.StageStart", {stage : stage.dependantOn.toString()}))
      }

      if (stage.app)
        stage.app.render(true)
      else {
        stage.app = new stage.class(
          this.data,
          {
            complete : this.complete.bind(this), // Function used by the stage to complete itself
            index : Number(ev.currentTarget.dataset.stage),
            message : this.message
          })
        stage.app.render(true)
      }
    })
  }
}



