import { ChargenStage } from "./stage";
export class FactionStage extends ChargenStage {
    journalId = "JournalEntry.rwldURPIV6B6iNBT.JournalEntryPage.fznKbHtkiCXchcDg"

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.resizable = true;
        options.width = 600;
        options.height = "auto";
        options.classes.push("faction");
        options.minimizable = true;
        options.dragDrop.push({dragSelector : ".list .list-item:not(.no-drag)"});
        options.title = game.i18n.localize("IMPMAL.CHARGEN.StageTitle.Faction");
        options.cannotResubmit = true;
        return options;
    }

    static get title() { return game.i18n.localize("IMPMAL.CHARGEN.StageTitle.Faction"); }

    get factionItemMap() 
    {
        return  { 
            "Adeptus Administratum" : "bHebLGbKASjqUQu8",
            "Adeptus Astra Telepathica" : "BLOQk9yJsb03nyDH",
            "Adeptus Mechanicus" : "XFPir4cg9PIHWNkc",
            "Adeptus Ministorum" : "PdQjDIH5C6kx3vAy",
            "Astra Militarum" : "yJNgIfm0cNk85aIe",
            "Imperial Fleet" : "0DNYdNKKglMlFOko",
            "Infractionist" : "oa5nKvqMjOoHsBcK",
            "The Inquisition" : "I8BJ1QcLwzC85KTF",
            "Rogue Trader Dynasty" : "N3xtZGybYbWZlAhS",
            "Ordo Xenos" : "cY8QqkSqrdfk9Dyp",
            "Ordo Hereticus" : "CDCRywl9EgXMoTdr",
            "Ordo Malleus" : "xb6SwipCKT9Vrvjt",
        }

    }

    constructor(...args) {
        super(...args);
        this.context.step = 0;
        this.context.faction = null;
        this.context.characteristic = null;
        this.context.skills = {};
        this.context.origin = this.data.items.origin.item;
        this.context.equipment = [];
        this.context.talents = [];
        this.context.exp = 0;
    }


    get template() {
        return "systems/impmal/templates/apps/chargen/faction.hbs";
    }

    async getData() {
        let data = await super.getData()
        if (this.context.faction)
            data.factionDescription = await TextEditor.enrichHTML(this.context.faction.system.character.notes, {async : true})

        
        if (this.context.equipment.length)
        {
            data.equipmentList = this.context.equipment.map(i => i.name).join(", ");
        }

        if (this.context.talents.length)
        {
            data.talentList = this.context.talents.map(i => i.name).join(", ");
        }

        return data
    }

    async _updateObject(event, formData) {
        let data = foundry.utils.expandObject(formData);
        this.data.choices.faction = data.characteristic;
        for(let skill in data.skills)
        {
            this.data.skills[skill] += data.skills[skill];
        }
        this.data.items.faction = {
            item : this.context.faction.toObject(),
            equipment : (await Promise.all(this.context.equipment.map(i => this.context.faction.system.character.equipment.getOptionDocument(i.id)))).filter(i => i),
            talents : (await Promise.all(this.context.talents.map(i => this.context.faction.system.character.talents.getOptionDocument(i.id)))).filter(i => i),
        }
        this.data.exp.faction = this.context.exp;

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

        html.find(".choice-menu").click(async ev => {
            let path = ev.currentTarget.dataset.path;
            let choices = await ChoiceDecision.awaitSubmit(this.context.faction.system.character[path]);
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
          let faction = await Item.implementation.fromDropData(dragData)
    
          if (faction.type != "faction")
            return
    
          this.context.step = 1;
          this.context.exp = 0;
          this.setFaction(faction)
          this.updateMessage("Chosen", {chosen : faction.name})
        }
        this.render(true);
    }

    validate()
    {
        if (!this.context.faction)
        {
            this.showError("Faction")
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
        let total = this.context.faction.system.character.advances.value;
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

        return true;
    }

    async rollFaction(event) {
        this.context.step++;
        if (!this.context.origin)
        {
            ui.notifications.error("No Origin Item found to determine Faction Table")
            return;
        }
        let table = await this.context.origin.system.factionTable.document;
        if (table)
        {
            let roll = await table.roll();
            let factionName = roll?.results[0]?.text;
            let factionId = this.factionItemMap[factionName];
            let faction = await game.impmal.utility.findId(factionId);
            this.setFaction(faction);
            if (this.context.faction)
            {
                this.context.exp = 75
                this.updateMessage("Rolled", {rolled : faction.name})
            }
            else 
            {
                ui.notifications.error("Faction Item couldn't be found")
            }
            this.render(true);
        }
    }

    setFaction(faction)
    {
        this.context.faction = faction;
        if (faction.system.character.equipment.options.length == 1)
        {
            this.context.equipment = [faction.system.character.equipment.options[0]]
        }
        if (faction.system.character.talents.options.length == 1)
        {
            this.context.talents = [faction.system.character.talents.options[0]]
        }
    }
}
