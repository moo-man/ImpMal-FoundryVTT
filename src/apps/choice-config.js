export class ChoiceConfig extends FormApplication 
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "choice-config"]);
        options.title = game.i18n.localize("IMPMAL.ChoiceConfig");
        options.resizable = true;
        options.height = 300;
        options.width = 200;
        options.template = "systems/impmal/templates/apps/choice-config.hbs";
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "choices" }];
        options.dragDrop.push([{ dragSelector: ".item-list .item", dropSelector: null }]);
        return options;
    }


    async getData()
    {
        let data = await super.getData();
        return data;
    }

    async _onDrop()
    {
        
    }


    async _updateObject()
    {
        // this.object.update(this.actor.toObject());
    }

    activateListeners(html)
    {
        super.activateListeners(html);
        

    }

    
}