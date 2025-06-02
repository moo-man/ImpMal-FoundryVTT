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
        [ui.combat].concat(foundry.applications.instances.get("combat-popout") || []).forEach(tracker => {
            tracker.element.querySelectorAll(".resource input").forEach((input) => {
                input.value = this.get(input.dataset.key);
            });
        })
    }

    // Add resource input to combat tracker
    addResourceFields(app, html)
    {
        let header = html.querySelector(".combat-tracker-header");
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
        let resources = document.createElement("div");
        resources.classList.add("resources");
        resources.innerHTML = fieldsHTML;
        
        resources.querySelectorAll(".resource input").forEach(e => {
            
            e.addEventListener("focusin", (ev) => 
            {
                ev.target.select();
            });

            e.addEventListener("change", (ev) => 
            {   
                this.set(ev.target.dataset.key, ev.target.value);
            });
        });


        header.insertAdjacentElement("beforeend", resources);
    }
}