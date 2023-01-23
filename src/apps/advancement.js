export class AdvancementForm extends FormApplication 
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "advancement"]);
        options.title = game.i18n.localize("IMPMAL.Advancement");
        options.resizable = true;
        options.height = 600;
        options.width = 400;
        options.template = "systems/impmal/templates/apps/advancement.hbs";
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "characteristics" }];
        return options;
    }


    constructor(...args)
    {
        super(...args);
        this.actor = this.object.clone();
    }

    async getData()
    {
        let data = await super.getData();
        data.actor = this.actor;
        return data;
    }


    async _updateObject()
    {
        this.object.update(this.actor.toObject());
    }

    activateListeners(html)
    {
        super.activateListeners(html);

        html.find(".increase,.decrease").on("click", (ev) => 
        {
            let value = ev.currentTarget.classList.contains("increase") ? 1 : -1;
            let itemId = ev.currentTarget.dataset.item;
            let skillKey = ev.currentTarget.dataset.skill;
            let characteristicKey = ev.currentTarget.dataset.characteristic;

            if (itemId)
            {
                let item = this.actor.items.get(itemId);
                item.updateSource({"system.advances" : item.system.advances + value});
            }
            else if (skillKey)
            {
                this.actor.updateSource({[`system.skills.${skillKey}.advances`] : this.actor.system.skills[skillKey].advances + value});
            }
            else if (characteristicKey)
            {
                this.actor.updateSource({[`system.characteristics.${characteristicKey}.advances`] : this.actor.system.characteristics[characteristicKey].advances + value});
            }

            this.actor.prepareData();
            this.render(true);
        });
    }

    
}