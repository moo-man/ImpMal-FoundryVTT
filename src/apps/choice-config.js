import ImpMalSheetMixin from "../sheet/mixins/sheet-mixin";

export class ChoiceConfig extends ImpMalSheetMixin(FormApplication)
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "choice-config"]);
        options.title = game.i18n.localize("IMPMAL.ChoiceConfig");
        options.resizable = true;
        options.height = 500;
        options.width = 400;
        options.template = "systems/impmal/templates/apps/choice-config.hbs";
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "choices" }];
        options.dragDrop.push([{ dragSelector: ".item-list .item", dropSelector: null }, { dragSelector: ".list .list-item", dropSelector: null }, { dragSelector: ".option", dropSelector: null }]);
        return options;
    }

    constructor(...args)
    {
        super(...args);
        this.choices = getProperty(this.object.system, this.options.path);
    }

    async getData()
    {
        let data = await super.getData();
        data.options = this.choices.options;
        data.structureHTML = this.constructStructureHTML();
        return data;
    }

    constructStructureHTML(structure)
    {
        structure = structure || this.choices.structure;
        return `<div class="choice" data-id=${structure.id}>
        ${this._choiceHTML(structure.options)}
        </div>`;
    }

    _choiceHTML(options, type)
    {
        let choiceLabel = game.i18n.localize(type == "AND" ? "IMPMAL.ChoiceAND" : "IMPMAL.ChoiceOR");
        return options.map(i => 
        {
            if (i.type != "option")
            {
                return this.constructStructureHTML(i);
            }
            else 
            {
                let option = this.choices.options.find(c => c.id == i.id);
                return `<a class="option" data-id=${option.id}>${option.name}</a>`;
            }
        }).join(`<span class="connector">${choiceLabel}</span>`);
    }

    async _onDrop(ev)
    {
        let dropData = JSON.parse(ev.dataTransfer.getData("text/plain"));
        let document;
        if (dropData.type == "Item")
        {
            document = await Item.implementation.fromDropData(dropData);
        }
        else if (dropData.type == "ActivEffect")
        {
            document = await ActiveEffect.implementation.fromDropData(dropData);
        }
        else if (dropData.type == "option" && dropData.id)
        {
            this.handleOptionDrop(ev.target.dataset.id, dropData.id);
        }
        if (document)
        {
            this._updateObject(this.choices.addOption(document));
        }
    }

    handleOptionDrop(dropId, optionId)
    {
        this._updateObject({structure : this.choices.move(optionId, dropId)});
    }



    async _updateObject(choices)
    {
        await this.object.update({[`system.${this.options.path}`] : choices});
        this.choices = getProperty(this.object.system, this.options.path);
        this.render(true);
    }

    activateListeners(html)
    {
        super.activateListeners(html);
        new DragDrop({dragSelector: ".option", dropSelector : ".option", callbacks: {dragstart : this._onDragOption.bind(this)}}).bind(html[0]);
        this.addGenericListeners(html);
    }

    _onDragOption(ev)
    {
        ev.dataTransfer.setData("text/plain", JSON.stringify({type : "option", id : ev.target.dataset.id}));
    }

    _onListDelete(event) 
    {
        let id = this._getId(event);
        this._updateObject(this.choices.deleteOption(id));
    }

    
}