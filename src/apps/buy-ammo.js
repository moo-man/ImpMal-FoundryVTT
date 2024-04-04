export class BuyAmmoForm extends FormApplication
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "buy-ammo"]);
        options.title = game.i18n.localize("IMPMAL.BuyAmmo");
        options.resizable = true;
        options.template = "systems/impmal/templates/apps/buy-ammo.hbs";
        return options;
    }

    constructor(object, options)
    {
        super(object, options);

        if (this.object.system.category == "launcher" || this.object.system.category == "grenadesExplosives")
        {
            ui.notifications.error(game.i18n.localize("IMPMAL.ErrorTypeAmmo"));
            throw new Error(game.i18n.localize("IMPMAL.ErrorTypeAmmo"));
        }
        this.count = 1;
        this.total = 0;
    }


    getData() 
    {
        let data = super.getData();
        data.count = this.count;
        data.total = this.count * this.object.system.ammoCost;
        return data;
    }


    async _updateObject(ev, formData)
    {
        let cost = ev.submitter.classList.contains("buy") ? this.object.system.ammoCost * formData.count : 0;
        let quantity = formData.count * this.object.system.mag.value;
        let name = this.object.name  + " Ammo";
        let existing = this.object.actor.itemTypes["ammo"].find(i => i.name == name); // Ammo with the same name already owned by Actor (don't create duplicates)
        // Check if Actor can afford ammo
        if (this.object.actor)
        {
            if (cost > this.object.actor.system.solars)
            {
                ui.notifications.error(game.i18n.localize("IMPMAL.NotEnoughSolars"));
                throw Error(game.i18n.localize("IMPMAL.NotEnoughSolars"));
            }
            await this.object.actor.update({"system.solars" : this.object.actor.system.solars - cost});
        }

        if (existing)
        {
            existing.update({"system.quantity" : existing.system.quantity + quantity});
        }
        else 
        {

            Item.create({
                name,
                type : "ammo", 
                "system.quantity" : quantity,
                "system.cost" : this.object.system.ammoCost * formData.count, // Cost might be 0 (if free) so recalculate it here
                "system.availability" : this.findAmmoAvailability(this.object.system.availability)
            }, {parent : this.object.actor});

        }

        ChatMessage.create({
            speaker : ChatMessage.getSpeaker({actor : this.object.actor}),
            content : `<p>Bought ${quantity} ${name} Ammo</p><p><strong>Cost</strong>: ${cost}</p>`
        });
    }

    findAmmoAvailability(key)
    {
        return {
            "common" : "common",
            "scarce" : "common",
            "rare" : "scarce",
            "exotic" : "rare"
        }[key] || "";
    }

    activateListeners(html)
    {
        super.activateListeners(html);

        html.find("input").change(ev => 
        {
            this[ev.currentTarget.name] = Number(ev.target.value);
            this.render(true);
        });

    }
}