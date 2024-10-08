import ImpMalItemDiffSheet from "../sheet/items/item-sheet-diff";
import ImpMalSheetMixin from "../sheet/mixins/sheet-mixin";
import { ChoiceOptionForm } from "./choice-option";

export class ChoiceConfig extends ImpMalSheetMixin(FormApplication)
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "choice-config"]);
        options.title = game.i18n.localize("IMPMAL.ChoiceConfig");
        options.resizable = true;
        options.height = 300;
        options.width = 600;
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
        ${this._choiceHTML(structure.options, structure.type)}
        </div>`;
    }

    _choiceHTML(options, type)
    {
        let choiceLabel = game.i18n.localize(type == "and" ? "IMPMAL.ChoiceAND" : "IMPMAL.ChoiceOR");
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
        else if (dropData.type == "ActiveEffect")
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

    getOptionDocument(id, idType)
    {
        if (idType == "id" || idType == "uuid")
        {
            return game.impmal.utility.findId(id);
        }
        else if (idType == "relative")
        {
            let split = id.split(".");
            if (split[1] == "ActiveEffect")
            {
                return this.object.effects.get(split[2]);
            }
            else 
            {
                return this.object.items.get(split[2]);
            }
        }
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
        html.find(".connector").on("click", (ev) => 
        {
            this._updateObject({structure : this.choices.switch(this._getId(ev))});
        });
    }

    _onDragOption(ev)
    {
        ev.dataTransfer.setData("text/plain", JSON.stringify({type : "option", id : ev.target.dataset.id}));
    }

    async _onListCreate()
    {
        let structureData = await new Promise(resolve => 
        {
            new Dialog({
                title : game.i18n.localize("IMPMAL.CreateOption"),
                content : game.i18n.localize("IMPMAL.CreateOptionDetails"),
                buttons : {
                    placeholder : {
                        label : game.i18n.localize("IMPMAL.Placeholder"),
                        callback : () => 
                        {
                            resolve(this.choices.addOption({type : "placeholder", name : game.i18n.localize("IMPMAL.Placeholder")}));
                        }
                    },
                    filter : {
                        label : game.i18n.localize("IMPMAL.Filter"),
                        callback: () => 
                        {
                            resolve(this.choices.addOption({type : "filter", name : game.i18n.localize("IMPMAL.Filter")}));
                        }
                    }
                }
            }).render(true);
        });
        await this._updateObject(structureData);
        let index = this.choices.options.length - 1;
        new ChoiceOptionForm({choices : this.choices, index, update : this._updateObject.bind(this)}).render(true);

    }

    _onListDelete(event) 
    {
        let id = this._getId(event);
        this._updateObject(this.choices.deleteOption(id));
    }

    async _onListEdit(event) 
    {
        let optionId = this._getId(event);
        let options = foundry.utils.deepClone(this.choices.options);
        let index = options.findIndex(o => o.id == optionId);
        let {documentId, idType} = options[index];
        if (documentId)
        {
            let document = await this.getOptionDocument(documentId, idType);
            if (document.documentName == "Item")
            {
                new ImpMalItemDiffSheet(document, {diffUpdater : (newDiff) => 
                {
                    warhammer.utility.log("Updating DIFF: ", this.object, index, newDiff);
                    options[index].diff = newDiff;
                    if (newDiff.name)
                    {
                        options[index].name = newDiff.name;
                    }
                    this._updateObject({options});
                }, diff : options[index].diff}).render(true);
                
            }
            else 
            {
                document.sheet.render(true);
            }
        }
        else if (["placeholder", "filter"].includes(options[index].type))
        {
            new ChoiceOptionForm({choices : this.choices, index, update : this._updateObject.bind(this)}).render(true);
        }
    }

    
}