import ItemTraitsForm from "../../apps/item-traits";
import ImpMalItemSheet from "./item-sheet";

export default class ModificationItemSheet extends ImpMalItemSheet
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["modification"]);
        return options;
    }

    activateListeners(html) 
    {
        super.activateListeners(html);

        if (!this.isEditable)
        {
            return false;
        }
        html.find(".add-traits").click(this._onAddTraits.bind(this));
        html.find(".remove-traits").click(this._onRemoveTraits.bind(this));
    }

    _onAddTraits() 
    {
        new ItemTraitsForm(this.item, {path : "system.addedTraits"}).render(true);
    }

    _onRemoveTraits() 
    {
        new ItemTraitsForm(this.item, {path : "system.removedTraits"}).render(true);
    }
}