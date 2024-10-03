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
        options.title = game.i18n.localize("IMPMAL.CHARGEN.StageRole");
        return options;
    }

    static get title() { return game.i18n.localize("IMPMAL.CHARGEN.StageRole"); }

    constructor(...args) {
        super(...args);
        this.context.step = 0;
        this.context.role = null;
        this.context.exp = 0;
    }


    get template() {
        return "system/impmal/templates/apps/chargen/role.html";
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

    async _onDrop(event)
    {
        let dragData = JSON.parse(ev.dataTransfer.getData("text/plain"));

        if (dragData.type == "Item") {
          let role = await Item.implementation.fromDropData(dragData)
    
          if (role.type != "role")
            return
    
          this.context.step = 1;
          this.context.exp = 0;
          this.context.role = role
          this.updateMessage("Chosen", {chosen : role.name})
        }
        this.render(true);
    }

    validate()
    {
        if (!this.context.role)
        {
            this.showError("Role")
            return false
        }
        else return true
    }

    async rollRole(event) {
        this.context.step++;
        let roll = await game.impmal.tables.rollTable("role")
        this.context.exp = 25
        this.updateMessage("Rolled", {rolled : roll.text})
        this.retrieveRole(roll.object.documentId)
    }

    async retrieveRole(id) {
        this.context.role = await game.impmal.utility.findId(id);
        this.render(true);
    }
}
