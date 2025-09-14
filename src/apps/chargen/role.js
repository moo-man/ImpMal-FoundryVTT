import { ChargenStage } from "./stage";
export class RoleStage extends ChargenStage {
    journalId = "JournalEntry.rwldURPIV6B6iNBT.JournalEntryPage.fznKbHtkiCXchcDg"

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.resizable = true;
        options.width = 600;
        options.height = "auto";
        options.classes.push("role");
        options.minimizable = true;
        options.dragDrop.push({dragSelector : ".list .list-item:not(.no-drag)"});
        options.title = game.i18n.localize("IMPMAL.CHARGEN.StageTitle.Role");
        options.cannotResubmit = true;
        return options;
    }

    static get title() { return game.i18n.localize("IMPMAL.CHARGEN.StageTitle.Role"); }

    constructor(...args) {
        super(...args);
        this.context.step = 0;
        this.context.role = null;
        this.context.specialisations = [];
        this.context.skills = {};
        this.context.equipment = [];
        this.context.talents = [];
        this.context.exp = 0;
    }


    get template() {
        return "systems/impmal/templates/apps/chargen/role.hbs";
    }

    async getData() {
        let data = await super.getData()
        if (this.context.role)
            data.roleDescription = await foundry.applications.ux.TextEditor.enrichHTML(this.context.role.system.notes.player, {async : true})

        if (this.context.equipment.length)
        {
            data.equipmentList = this.context.equipment.map(i => i.name).join(", ")//`@UUID[${i.uuid}]{${i.name}}`).join(", ")
        }

        if (this.context.talents.length)
        {
            data.talentList = this.context.talents.map(i => i.name).join(", ")//`@UUID[${i.uuid}]{${i.name}}`).join(", ")
        }
        return data
    }

    async _updateObject(event, formData) {
        let data = foundry.utils.expandObject(formData);

        this.data.items.role = {
            item : this.context.role.toObject(),
            equipment : [],
            talents : []
        }

        for(let skill in data.skills)
        {
            this.data.skills[skill] += data.skills[skill];
        }

        this.data.exp.role = Number(formData.xp) || 0;
        for(let spec of this.context.specialisations)
        {
            if (spec.document)
            {
                if (this.data.specialisations[spec.document.uuid])
                {
                    this.data.specialisations[spec.document.uuid]++;
                }
                else 
                {
                    this.data.specialisations[spec.document.uuid] = 1;
                }
            }
        }

        this.data.items.role.equipment = (await Promise.all(this.context.equipment.map(i => this.context.role.system.equipment.getOptionDocument(i.id)))).filter(i => i)
        this.data.items.role.talents = await ItemDialog.create((await (Promise.all(this.context.role.system.talents.documents))), this.context.role.system.talents.number, {title : this.context.role.name, text : `Select ${this.context.role.system.talents.number}`});


        this.data.items.roles

        super._updateObject(event, formData)
    }

    validate()
    {
        if (!this.context.role)
        {
            this.showError("Role")
            return false
        }
        if (!this.validateChoices())
        {
            this.activateChoiceAlerts();
            this.showError("Choices")
            return false;
        }
        if (!this.validateAdvances())
        {
            return false;
        }
        return super.validate();
    }

    validateAdvances()
    {
        let allocated = Array.from(this.element.find(".skills input")).reduce((allocated, input) => allocated + (Number(input.value) || 0), 0)
        let total = this.context.role.system.skills.value;
        if (total > allocated)
        {
            this.showError("LowAdvances", {allocated, total})
            return false;
        }
        if (total < allocated)
        {
            this.showError("HighAdvances", {allocated, total})
            return false;
        }

        let tooHigh = Object.keys(this.context.skills).filter(skill => this.data.skills[skill] + this.context.skills[skill] > 2)
        if (tooHigh.length)
        {
            this.showError("TooManySkillAdvances", {skill : tooHigh.map(s => game.impmal.config.skills[s]).join(", ")});
            return false;
        }


        for(let spec of this.context.specialisations)
        {
            if (this.data.specialisations[spec.document.uuid] || this.context.specialisations.filter(i => i.document.uuid == spec.document.uuid).length > 1)
            {
                this.showError("TooManySpecAdvances")
                return false;
            }
        }

        return true;
    }

    validateChoices()
    {
      return this.context.specialisations.every(i => i.chosen)
    }

    activateListeners(html)
    {
        super.activateListeners(html);
        const dragDrop = new DragDrop({
            dropSelector: '.chargen-content',
            permissions: { drop: () => true },
            callbacks: { drop: this._onDrop.bind(this) },
          });

        dragDrop.bind(html[0]);

        html.find(".choose-spec").click(async ev => {
            let index = Number(ev.currentTarget.dataset.index);
            let currentSpecialisation = this.context.specialisations[index];

            let specialisations = this._specialisations || (await game.impmal.utility.getAllItems("specialisation")).filter(i => this.context.role.system.specialisations.keys.includes(i.system.skill))
            this._specialisations = specialisations;

            specialisations = specialisations.map(i => {return {name : `${game.impmal.config.skills[i.system.skill]} (${i.name})`, id : i.id}});
            let choice = await ItemDialog.create(specialisations, 1, {title : "Choose Specialisation"})
            if (choice[0])
            {
                currentSpecialisation.text = choice[0].name;
                currentSpecialisation.document = this._specialisations.find(i => i.id == choice[0].id);
                currentSpecialisation.chosen = true;
                this.render(true);
            }
        })

        html.find(".choice-menu").click(async ev => {
            let path = ev.currentTarget.dataset.path;
            let choices = await ChoiceDecision.awaitSubmit(this.context.role.system[path]);
            if (choices.length)
            {
                this.context[path] = choices;
                this.render(true);
            }
        })

        html.find(".choice-reset").click(async ev => {
            let path = ev.currentTarget.dataset.path;
            this.context[path] = []
            this.render(true);
        })
    }

    async _onDrop(ev)
    {
        let dragData = JSON.parse(ev.dataTransfer.getData("text/plain"));

        if (dragData.type == "Item") {
          let role = await Item.implementation.fromDropData(dragData)
    
          if (role.type != "role")
            return
    
          this.context.step = 1;
          this.context.exp = 0;
          this.context.role = role

            if (role.system.equipment.options.length == 1)
            {
                this.context.equipment = [role.system.equipment.options[0]]
            }

          this.context.specialisations = Array(this.context.role.system.specialisations.value).fill(null).map(i => {
            return {
                text : "Choose Specialisation",
                chosen : false
            }
        })
          this.updateMessage("Chosen", {chosen : role.name})
        }
        this.render(true);
    }
}
