import ItemTraitsForm from "../../apps/item-traits";
import ImpMalSheetMixin from "../mixins/sheet-mixin";


export default class ImpMalItemSheet extends ImpMalSheetMixin(WarhammerItemSheet)
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "item"]);
        options.width = 420;
        options.height = 600;
        options.resizable = true;
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }];
        options.dragDrop.push({dragSelector : ".list .list-item:not(.no-drag)"});
        options.scrollY.push(".tab-content");
        return options;
    }

    get template() 
    {
        return `systems/impmal/templates/item/item-${this.item.type}.hbs`;
    }

    async _render(force, options={})
    {
        await super._render(force, options);

        if (!this.element[0].classList.contains(this.item.type))
        {
            this.element[0].classList.add(this.item.type);
        }
    }

    async _onDrop(ev)
    {
        let dropData = JSON.parse(ev.dataTransfer.getData("text/plain"));
        if (dropData.type == "Item")
        {
            let item = await Item.implementation.fromDropData(dropData);
            if (item)
            {
                return this._onDropItem(ev, item);
            }
            else 
            {
                super._onDrop(ev);
            }
        }
        if (dropData.type == "RollTable")
        {
            let table = await RollTable.implementation.fromDropData(dropData);
            if (table)
            {
                return this._onDropTable(ev, table);
            }
            else 
            {
                super._onDrop(ev);
            }
        }
        else if (dropData.type == "ActiveEffect")
        {
            let effect = await ActiveEffect.implementation.fromDropData(dropData);
            this.item.createEmbeddedDocuments("ActiveEffect", [effect.toObject()]);
        }
    }

    _onDropItem(ev, item)
    {
        return this[`_onDropItem${item.type[0].toUpperCase() + item.type.substring(1)}`]?.(ev, item);
    }

    _canDragDrop()
    {
        return true;
    }

    /**
     * @abstract
     * @param {Event} ev Triggering Event
     * @param {RollTable} table 
     */
    _onDropTable()
    {

    }

    _getHeaderButtons() 
    {
        let buttons = super._getHeaderButtons();
        buttons.unshift(
            {
                class: "post",
                icon: "fas fa-comment",
                onclick: () => this.item.postItem()
            });

        if (!this.item.isOwned && this.item.system.isPhysical)
        {
            buttons.unshift(
                {
                    class: "availability",
                    icon: "fa-solid fa-shop",
                    onclick: () => this.item.system.setupAvailabilityTest().then(test => test.sendToChat())
                });
        }
        return buttons;
    }

    async getData() 
    {
        let data = super.getData();
        data.system = data.item.toObject(true).system; // Use source data to avoid ammo/mods from showing up in the sheet
        data.isPhysical = data.item.system.isPhysical;
        data.conditions = this.formatConditions(data);
        data.enriched = foundry.utils.expandObject({
            "notes.player" : await TextEditor.enrichHTML(data.item.system.notes?.player, {relativeTo: this.item, async: true}),
            "notes.gm" : await TextEditor.enrichHTML(data.item.system.notes?.gm, {relativeTo: this.item, async: true}),
            "patron.notes" : await TextEditor.enrichHTML(data.item.system.patron?.notes, {relativeTo: this.item, async: true}),
            "character.notes" : await TextEditor.enrichHTML(data.item.system.character?.notes, {relativeTo: this.item, async: true})
        });
        return data;
    }

    activateListeners(html) 
    {
        super.activateListeners(html);
        if (!this.isEditable)
        {
            return false;
        }
        
        this.addGenericListeners(html);
        html.find(".edit-traits").click(this._onEditTraits.bind(this));
        html.find(".choice-config").click(this._onChoiceConfig.bind(this));
        html.find(".choice-tree").click(this._onChoiceTree.bind(this));
        html.find(".compact-list a").click(this._onCompactItemClick.bind(this));
        html.find(".compact-list a").contextmenu(this._onCompactItemRightClick.bind(this));
        html.find(".list-diff").click(this._onDiffEdit.bind(this));
    }

    _onEditTraits(ev) 
    {
        let path = ev.currentTarget.dataset.path;
        new ItemTraitsForm(this.item, {path}).render(true);
    }
    
    async _onDiffEdit(ev)
    {
        let list = this._getList(ev, true);
        let index = this._getIndex(ev);

        let listObj = list.list[index].toObject();
        let document = await list.list[index].document;

        let newDiff = await WarhammerDiffEditor.wait(listObj.diff, {document : document.originalDocument});
        listObj.diff = newDiff;
        if (listObj.name)
        {
            listObj.name = newDiff.name;
        }
        else 
        {
            listObj.name = document.originalDocument.name;
        }
        this.item.update(list.edit(index, listObj));
    }

    _onChoiceConfig(ev) 
    {
        new ChoiceConfigV2(this.item, {path : ev.currentTarget.dataset.path}).render(true);
    }

    _onChoiceTree(ev) 
    {
        new ChoiceDecision(foundry.utils.getProperty(this.item.system, ev.currentTarget.dataset.path)).render(true);
    }


    async _onCompactItemClick(ev)
    {
        let path = this._getPath(ev);
        let index = this._getIndex(ev);
        let property = getProperty(this.item, path);
        let document;
        if (property.list)
        {
            document = await property.get(index)?.document;
        }
        else 
        {
            document = await property.document;
        }
        document.sheet.render(true);
    }
    _onCompactItemRightClick(ev)
    {
        let path = this._getPath(ev);
        let index = this._getIndex(ev);
        let model = getProperty(this.item, path);
        if (model.list)
        {
            this.item.update(model.remove(index));
        }
        else 
        {
            this.item.update(model.unset());
        }
    }
}