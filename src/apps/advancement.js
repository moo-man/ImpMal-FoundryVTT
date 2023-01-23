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
        this.actor.prepareData();
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

            this.render(true);
        });

        html.find(".other-new").on("change", (ev) => 
        {
            let newOther = {[`${ev.target.name}`] : (Number.isNumeric(ev.target.value) ? Number(ev.target.value) : (ev.target.value || 0))};

            this.actor.updateSource({"system.xp.other.list" : this.actor.system.xp.other.add(newOther)});
            this.render(true);
        });

        html.find(".other-edit").on("change", (ev) => 
        {
            let index = ev.currentTarget.parentElement.dataset.index;
            let other = this.actor.system.xp.other.list[index];
            other[ev.target.name] = Number.isNumeric(ev.target.value) ? Number(ev.target.value) : (ev.target.value || 0);

            let newList;

            // If both values deleted, remove the element
            if (!other.description && !other.xp)
            {
                newList = this.actor.system.xp.other.remove(index);
            }
            else // Otherwise just edit the element
            {
                newList = this.actor.system.xp.other.edit(index, other);
            }

            this.actor.updateSource({"system.xp.other.list" : newList});
            this.render(true);
        });
    }

    
}