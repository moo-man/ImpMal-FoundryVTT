import ImpMalItemSheet from "./item-sheet";

// Background is what i'm calling the group of items used in character creation, such as origin, faction, and role
export default class BackgroundItemSheet extends ImpMalItemSheet
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["background"]);
        return options;
    }


    activateListeners(html) 
    {
        super.activateListeners(html);

        html.find(".checkbox-array input").change(ev => 
        {
            let path = this._getPath(ev);
            let value = ev.currentTarget.dataset.value;
            let array = foundry.utils.deepClone(getProperty(this.object, path));
            if (ev.currentTarget.checked)
            {
                array.push(value);
            }
            else 
            {
                array = array.filter(v => v != value);
            }
            this.object.update({[path] : array});
        });
    }
}