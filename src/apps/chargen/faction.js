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
        options.title = game.i18n.localize("IMPMAL.CHARGEN.StageFaction");
        return options;
    }

    static get title() { return game.i18n.localize("IMPMAL.CHARGEN.StageFaction"); }

    // Origin item maps to a faction table
    // get factionTableMap() 
    // {
    //     return {
    //         "ADwxsrnXWBFViy5k" : "ep3s7nKOUoph2xIi", // Agri
    //         "jPXulXRUoZ099Cwl" : "oACrVcayoED73eW3", // Feral
    //         "pzvSXkckglOmZgdk" : "bWToySiNl72h2LiY", // Feudal
    //         "5SLj6QlgqqR0K5GX" : "EyH7uN45LGlL7zvy", // Forge
    //         "OjFcYwOwNH6WlUjT" : "BJ6DhPFbEXII8C9f", // Hive 
    //         "7E0Gkel1gSaxTgVu" : "hqHL2rKcOsSfYsrw", // Schola Progenium
    //         "i7qRAalBsnddJYeW" : "7MVzDzO1f96P1eWh", // Shrine
    //         "bFXPJAp4GsM8TB8F" : "71shyC6qN7Tnf0Rx", // Voidborn
    //     }
    // }

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
            "Rogue Trader Dynasty" : "N3xtZGybYbWZlAhS"
        }

    }

    constructor(...args) {
        super(...args);
        this.context.step = 0;
        this.context.faction = null;
        this.context.origin = this.data.items.origin;
        this.context.exp = 0;
    }


    get template() {
        return "systems/impmal/templates/apps/chargen/faction.hbs";
    }

    async getData() {
        let data = await super.getData()
        if (this.context.faction)
            data.factionDescription = await TextEditor.enrichHTML(this.context.faction.system.character.notes, {async : true})
        return data
    }

    _updateObject(event, formData) {
        this.data.items.faction = this.context.faction.toObject();
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
    }

    async _onDrop(event)
    {
        let dragData = JSON.parse(ev.dataTransfer.getData("text/plain"));

        if (dragData.type == "Item") {
          let faction = await Item.implementation.fromDropData(dragData)
    
          if (faction.type != "faction")
            return
    
          this.context.step = 1;
          this.context.exp = 0;
          this.context.faction = faction
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
        else return true
    }

    async rollFaction(event) {
        this.context.step++;
        if (!this.context.origin)
        {
            ui.notifications.error("No Origin Item found to determine Faction Table")
            return;
        }
        let table = await game.impmal.utility.findId(this.context.origin.system.factionTable.id)
        if (table)
        {
            let roll = await table.roll();
            let factionName = roll?.results[0]?.text;
            let factionId = this.factionItemMap[factionName];
            await this.retrieveFaction(factionId);
            if (this.context.faction)
            {
                this.context.exp = 25
                this.updateMessage("Rolled", {rolled : roll.text})
            }
            else 
            {
                ui.notifications.error("Faction Item couldn't be found")
            }
        }
    }
    
    async retrieveFaction(id) {
        this.context.faction = await game.impmal.utility.findId(id);
        this.render(true);
    }
}
