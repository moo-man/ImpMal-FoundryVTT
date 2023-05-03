import ItemTraitsForm from "../../apps/item-traits";
import ImpMalSheetMixin from "../mixins/sheet-mixin";


export default class ImpMalItemSheet extends ImpMalSheetMixin(ItemSheet)
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "item"]);
        options.width = 400;
        options.height = 600;
        options.resizable = true;
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }];
        options.dragDrop.push({dragSelector : ".list .list-item" });
        options.scrollY.push(".tab-content");
        return options;
    }

    get template() 
    {
        return `systems/impmal/templates/item/item-${this.item.type}.hbs`;
    }

    async _render(...args)
    {
        await super._render(...args);
        if (!this.element[0].classList.contains(this.item.type))
        {
            this.element[0].classList.add(this.item.type);
        }
    }

    async getData() 
    {
        let data = super.getData();
        data.system = data.item.toObject(true).system; // Use source data to avoid ammo/mods from showing up in the sheet
        data.isPhysical = Object.keys(game.template.Item).filter(i => game.template.Item[i].templates?.includes("physical")).includes(data.item.type);
        data.conditions = this.formatConditions(data).filter(i => data.item.system.allowedConditions.includes(i.id));
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
        html.find(".array-create").click(this._onCreateArrayElement.bind(this));
        html.find(".array-edit").change(this._onEditArrayElement.bind(this));
        html.find(".array-delete").click(this._onDeleteArrayElement.bind(this));
        html.find(".edit-traits").click(this._onEditTraits.bind(this));
        html.find(".choice-config").click(this._onChoiceConfig.bind(this));
    }

    _onCreateArrayElement(ev)
    {
        let target = ev.currentTarget.dataset.target; // Location of the list model
        let arrayModel = getProperty(this.item, target);
        return this.item.update({[target + ".list"] : arrayModel.add()});
    }

    _onEditArrayElement(ev)
    {
        let target = ev.currentTarget.parentElement.dataset.target;    // Location of the list model
        let index = ev.currentTarget.parentElement.dataset.index;      // Index to be edited
        let property = ev.currentTarget.dataset.property;       // Property to be edited (if element is an object)

        let arrayModel = getProperty(this.item, target);

        let value;

        // If property is specified, means that array elements are objects
        // Only edit that property specified
        if (property)
        {
            value = {[`${property}`] : ev.target.value};
        }
        else // If no property specified, it must be a string or number
        {
            value = ev.target.value;
            if (Number.isNumeric(value))
            {
                value = Number(value);
            }
        }

        return this.item.update({[target + ".list"] : arrayModel.edit(index, ev.target.value)});
    }

    _onDeleteArrayElement(ev)
    {
        let target = ev.currentTarget.parentElement.dataset.target;    // Location of the list model
        let index = ev.currentTarget.parentElement.dataset.index;      // Index to be deleted
        let arrayModel = getProperty(this.item, target);
        return this.item.update({[target + ".list"] : arrayModel.remove(index)});
    }

    _onEditTraits() 
    {
        new ItemTraitsForm(this.item).render(true);
    }

    _onChoiceConfig(ev) 
    {
        new game.impmal.apps.ChoiceConfig(this.item, {path : ev.currentTarget.dataset.path}).render(true);
    }
}