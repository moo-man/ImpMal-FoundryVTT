import { DetailsStage } from "./details";
import { CharacteristicsStage } from "./characteristics";
import { FactionStage } from "./faction";
import { RoleStage } from "./role";
import { OriginStage } from "./origin";
import { ImpMalItem } from "../../document/item";
import { XPModel } from "../../model/actor/components/xp";

/**
 * This class is the center of character generation through the chat prompts
 */
export default class CharGenIM extends FormApplication {
  constructor(existing={}, options) {
    super(null, options);
    this.data = existing?.data || {
      exp: {
        characteristics: 0,
        origin: 0,
        faction: 0,
        role: 0
      },
      items: {},
      choices : {

      },
      specialisations: {

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

    this.actor = {type: "character", system: foundry.utils.deepClone(game.model.Actor.character), items: [] }

    if (!game.user.isGM)
    {
      ChatMessage.create({content : game.i18n.format("IMPMAL.CHARGEN.Message.Start", {user : game.user.name})}).then(msg => this.message = msg)
    }

    // Warn user if they won't be able to create a character
    if (!game.user.isGM && !game.settings.get("core", "permissions").ACTOR_CREATE.includes(game.user.role) && !game.users.find(u => u.isGM && u.active))
    {
      ui.notifications.warn(game.i18n.localize("IMPMAL.CHARGEN.Warn.NoGM"), {permanent : true})
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

    let allItems = []
    for(let stage of Object.values(this.data.items))
    {
      for(let items of Object.values(stage))
      {
          allItems = allItems.concat(items)
      }
    }

    allItems = allItems.map(i => {
      if (i instanceof Item)
      {
        return i;
      }
      else 
      {
        return new ImpMalItem(i);
      }
    })


    let allChanges = allItems
    .filter(i => i)
    .reduce((prev, current) => prev.concat(Array.from(current.effects.contents)), []) // reduce items to effects
    .reduce((prev, current) => prev.concat(current.changes), [])      // reduce effects to changes
    .filter(c => c.key.includes("characteristics"))                   // filter changes to characteristics

    let characteristics = foundry.utils.deepClone(this.data.characteristics);
    let skills = foundry.utils.deepClone(this.data.skills);
    let origin = foundry.utils.getProperty(this.data.items, "origin.item");
    let faction = foundry.utils.getProperty(this.data.items, "faction.item");


    if (faction)
    {
      characteristics[faction.system.character.characteristics.base].starting += 5;
      characteristics[this.data.choices.faction].starting += 5;
    }

    if (origin)
    {
      if (origin.system.characteristics.base)
      {
        characteristics[origin.system.characteristics.base].starting += 5;
      }
      if (this.data.choices.origin)
      {
        characteristics[this.data.choices.origin].starting += 5;
      }
    }
  

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


    let skillText = []
    let specialisations = await Promise.all(Object.keys(this.data.specialisations).map(fromUuid));

    // Show Advanced Skills
    for(let skill in skills)
    {
      if (skills[skill] != 0)
      {
        let skillName = game.impmal.config.skills[skill];
        skills[skill] = 5 * skills[skill] + characteristics[game.impmal.config.defaultSkillCharacteristics[skill]].total
        skillText.push(`${skillName} ${skills[skill]}`)
        // Add any specialisations that have been advanced for each skill
        for(let spec of specialisations.filter(i => i.system.skill == skill))
        {
          skillText.push(`${skillName} (${spec.name}) ${skills[skill] + 5 * this.data.specialisations[spec.uuid]}` )
        }
      }
    }

    // Add Specialisations where the base skill hasn't been advanced
    for(let spec of specialisations.filter(i => skills[i.system.skill] == 0))
    {
      let skillName = game.impmal.config.skills[spec.system.skill];

      skillText.push(`${skillName} (${spec.name}) ${characteristics[game.impmal.config.defaultSkillCharacteristics[spec.system.skill]].total + 5 * this.data.specialisations[spec.uuid]}` )
    }

    let exp = 0
    for(let stageExp of Object.values(this.data.exp))
    {
      exp += stageExp
    }

    this.stages.forEach(stage => {
      stage.title ??= stage.class.title;
    })

    return {
      stages: this.stages,
      characteristics,
      data : this.data,
      stageHTML :  await this._getStageHTML(),
      skills : skillText.join(", "),
      talents : allItems.filter(i => i.type == "talent").map(i => i.name).join(", "),
      equipment : allItems.filter(i => ["weapon", "equipment", "protection"].includes(i.type)).map(i => i.name).join(", "),
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

      for(let exp in this.data.exp)
      {
        if (Number.isNumeric(this.data.exp[exp]))
          this.actor.system.xp.total += Number(this.data.exp[exp])
      }

      for(let stage in this.data.items)
      {
        let stageItems = [];
        for(let key in this.data.items[stage])
        {
          stageItems = stageItems.concat(this.data.items[stage][key])
        }
        this.actor.items = this.actor.items.concat(stageItems.map(i => {
          if (i instanceof Item)
          {
            return i.toObject()
          }
          else 
          {
            return i;
          }
        }));
      }


      for(let skill in this.data.skills)
      {
        this.actor.system.skills[skill].advances = this.data.skills[skill];
      }

      for(let uuid in this.data.specialisations)      
      {
        let spec = await fromUuid(uuid);
        let specData = spec.toObject()
        specData.system.advances = this.data.specialisations[uuid];
        this.actor.items.push(specData);
      }

      mergeObject(this.actor.system.characteristics, this.data.characteristics);

      for(let characteristic of Object.values(this.data.choices))
      {
        if (characteristic)
        {
          this.actor.system.characteristics[characteristic].starting += 5;
        }
      }

      let origin = foundry.utils.getProperty(this.data.items, "origin.item");
      let faction = foundry.utils.getProperty(this.data.items, "faction.item");
  
      if (faction)
      {
        this.actor.system.characteristics[faction.system.character.characteristics.base].starting += 5;
        this.actor.system.solars = faction.system.character.solars;
      }
  
      if (origin && origin.system.characteristics.base)
      {
        this.actor.system.characteristics[origin.system.characteristics.base].starting += 5;
      }
    

      this.actor.name = this.data.details.name || "New Character"

      this.actor.system.details.gender = this.data.details.gender
      this.actor.system.details.age = this.data.details.age
      this.actor.system.details.species = "Human"
      this.actor.system.details.height = this.data.details.height
      this.actor.system.details.eyes = this.data.details.eyes
      this.actor.system.details.hair = this.data.details.hair
      this.actor.system.details.feature = this.data.details.feature
      this.actor.system.goal.short = this.data.details.short
      this.actor.system.goal.long = this.data.details.long
      this.actor.system.connections.list = this.data.details.connections || []

      this.actor.system.notes.player = `<p>${this.actor.system.connections.list.join("</p><p>")}</p>`


      let xp = XPModel.computeSpentFor(new Actor.implementation(foundry.utils.deepClone(this.actor)));

      this.actor.system.xp.other = {list : [{xp : -xp, description : "Character Creation"}]};


      mergeObject(this.actor, expandObject(this.data.misc), {overwrite : true})

      if (game.user.isGM || game.settings.get("core", "permissions").ACTOR_CREATE.includes(game.user.role))
      {
        // Create items separately
        let items = this.actor.items;
        delete this.actor.items;

        let document = await Actor.implementation.create(this.actor);
        document.createEmbeddedDocuments("Item", items, {skipRequirement : true, skipOrigin : true, skipFaction : true});
        document.sheet.render(true);
        localStorage.removeItem("impmal-chargen")
      }
      else {
        // Create temp actor to handle any immediate scripts
        let tempActor = await Actor.implementation.create(this.actor, {temporary: true})

        for(let i of tempActor.items.contents)
        {
          await i._preCreate(i._source, {skipRequirement : true, skipOrigin : true, skipFaction : true}, game.user.id);
        }

        let actorData = tempActor.toObject();
        actorData._id = randomID();
        game.user.flags.waitingForCreatedActor = actorData._id;
        const payload =  {fromId : game.user.id, actor : actorData}
        SocketHandlers.call("createActor", payload);
      }
    }
    catch(e)
    {
      ui.notifications.error(game.i18n.format("IMPMAL.CHARGEN.ERROR.Create", {error: e.stack}))
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


// Complete character creation for a user who has sent their actor data to a GM to create
// If the ID matches the locally stored ID, render actor and complete process
Hooks.on("createActor", async (document) => {
  if (document.id == game.user.flags.waitingForCreatedActor)
  {
    if (document && document.isOwner) 
    {
      for(let i of document.items.contents)
        {
          // Run onCreate scripts
          await i._onCreate(i._source, {skipRequirement : true, skipOrigin : true, skipFaction : true}, game.user.id);
        }
        document.sheet.render(true)
        localStorage.removeItem("impmal-chargen")
      }
    delete game.user.flags.waitingForCreatedActor;
  }
})


