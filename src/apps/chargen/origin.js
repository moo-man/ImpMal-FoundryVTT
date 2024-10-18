import { ChargenStage } from "./stage";
export class OriginStage extends ChargenStage {
    journalId = "JournalEntry.rwldURPIV6B6iNBT.JournalEntryPage.fznKbHtkiCXchcDg"

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.resizable = true;
        options.width = 600;
        options.height = "auto";
        options.classes.push("origin");
        options.minimizable = true;
        options.dragDrop.push({dragSelector : ".list .list-item:not(.no-drag)"});
        options.title = game.i18n.localize("IMPMAL.CHARGEN.StageTitle.Origin");
        return options;
    }

    static get title() { return game.i18n.localize("IMPMAL.CHARGEN.StageTitle.Origin"); }

    constructor(...args) {
        super(...args);
        this.context.step = 0;
        this.context.origin = null;
        this.context.exp = 0;
    }


    get template() {
        return "systems/impmal/templates/apps/chargen/origin.hbs";
    }

    async getData() {
        let data = await super.getData()
        if (this.context.origin)
            data.originDescription = await TextEditor.enrichHTML(this.context.origin.system.notes.player, {async : true})
        return data
    }

    _updateObject(event, formData) {
        this.data.items.origin = this.context.origin.toObject();
        this.context.characteristic = formData.characteristic;
        this.data.choices.origin = formData.characteristic;
        this.data.exp.origin = this.context.exp;
        super._updateObject(event, formData)
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
    }

    async _onDrop(ev)
    {
        let dragData = JSON.parse(ev.dataTransfer.getData("text/plain"));

        if (dragData.type == "Item") {
          let origin = await Item.implementation.fromDropData(dragData)
    
          if (origin.type != "origin")
            return
    
          this.context.step = 1;
          this.context.exp = 0;
          this.context.origin = origin
          this.updateMessage("Chosen", {chosen : origin.name})
        }
        this.render(true);
    }

    validate()
    {
        if (!this.context.origin)
        {
            this.showError("Origin")
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

    async rollOrigin(event) {
        this.context.step++;
        let roll = await game.impmal.tables.rollTable("origin", null, {showRoll : false, showResult : false});
        this.context.exp = 25
        this.updateMessage("Rolled", {rolled : roll.text})
        this.retrieveOrigin(roll.documentId)
    }

    async retrieveOrigin(id) {
        this.context.origin = await game.impmal.utility.findId(id);
        this.render(true);
    }
}
