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
        options.title = game.i18n.localize("IMPMAL.CHARGEN.StageRole");
        return options;
    }

    static get title() { return game.i18n.localize("IMPMAL.CHARGEN.StageRole"); }

    constructor(...args) {
        super(...args);
        this.context.step = 0;
        this.context.role = null;
        this.context.specialisations = [];
        this.context.exp = 0;
    }


    get template() {
        return "systems/impmal/templates/apps/chargen/role.hbs";
    }

    async getData() {
        let data = await super.getData()
        if (this.context.role)
            data.roleDescription = await TextEditor.enrichHTML(this.context.role.system.notes.player, {async : true})
        return data
    }

    _updateObject(event, formData) {
        this.data.items.role = this.context.role.toObject();
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
        return super.validate();
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
