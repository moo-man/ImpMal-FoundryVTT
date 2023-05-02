export class ChoiceOptionForm extends FormApplication 
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "choice-option"]);
        options.title = game.i18n.localize("IMPMAL.ChoiceOption");
        options.resizable = true;
        options.width = 300;
        options.template = "systems/impmal/templates/apps/choice-option.hbs";
        return options;
    }

    constructor(...args)
    {
        super(...args);
        this.object.option = foundry.utils.deepClone(this.object.choices.options[this.object.index]);
    }

    getData() {
        let data = super.getData();
        return data;
    }

    _updateObject(ev, formData)
    {
        let choices = foundry.utils.deepClone(this.object.choices);
        choices.options[this.object.index] = this.object.option;
        this.object.update(choices);
    }

    activateListeners(html)
    {
        super.activateListeners(html);

        html.find("input").on("change", ev => 
        {            
            if (ev.currentTarget.name)
            {
                this.object.option[ev.currentTarget.name] = ev.currentTarget.value;
            }
            else 
            {
                let index = $(ev.currentTarget).parents("[data-index]").attr("data-index");
                let property = ev.currentTarget.dataset.property;
                let filter = this.object.option.filters[index];
                filter[property] = ev.target.value;
                if (!filter.path && !filter.op && !filter.value) // Delete filter if no data
                {
                    this.object.option.filters.splice(index, 1);
                }
                this.render(true);
            }
        });

        html.find(".list-create").on("click", () => 
        {
            this.object.option.filters.push({});
            this.render(true);
        }); 
    }


}