export default class ResourceManager
{
    constructor() 
    {
        this.resources = {}
    }

    registerResource(label, scope, key, hidden)
    {
        this.resources[key] = {
            scope,
            key,
            hidden,
            label
        }
        this.resources[key].value = this.get(key);
    }

    get(key)
    {
        if (key.includes("."))
        {
            return game.settings.get(key.split(".")[0], key.split("."[1]));
        }
        else 
        {
            return game.settings.get(this.resources[key].scope, key);
        }
    }

    set(key, value)
    {
        game.settings.set(this.resources[key].scope, key, value);
    }

    isResource(setting)
    {
        let key = setting.split(".")[1];
        return !!this.resources[key];
    }

    onResourceChanged(key) 
    {
        if (key.includes("."))
        {
            key = key.split(".")[1];
        }
        this.resources[key].value = this.get(key);

        Hooks.call(`impmal:${key}Changed`, this.resources[key].value);
        this.updateResourceFields();
    }

    updateResourceFields()
    {
        // Make sure all combat trackers (popped out and embedded) have the correct value
        [ui.combat].concat(Object.values(ui.windows).filter(w => w instanceof CombatTracker)).forEach(tracker => {
            tracker.element.find(".resource input").each((index, input) => {
                input.value = this.get(input.dataset.key);
            });
        })
    }

    // Add resource input to combat tracker
    addResourceFields(app, html)
    {
        let header = html.find(".combat-tracker-header");
        let fieldsHTML = Object.values(this.resources).map(i => {
            if (!game.user.isGM && i.hidden)
            {
                return "";
            }
            else 
            return `<div class="resource">
                    <label>${game.i18n.localize(i.label)}</label>
                    <input data-key=${i.key} type=number ${game.user.isGM ? "" : "disabled"} value='${i.value}'>
                </div>`
        }).join("");
        let resources = $(`<div class="resources">
            ${fieldsHTML}
        </div>`);

        resources.find(".resource input").on("change", (ev) => 
        {   
            this.set(ev.target.dataset.key, ev.target.value);
        });

        resources.find(".resource input").on("focusin", (ev) => 
        {
            ev.target.select();
        });


        resources.insertAfter(header);
    }
}