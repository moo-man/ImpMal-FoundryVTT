export default class BuyAmmoForm extends WHFormApplication
{
    static DEFAULT_OPTIONS = {
        tag : "form",
        classes : ["impmal", "buy-ammo"],
        window : {
            title : "IMPMAL.BuyAmmo",
        },
        form: {
            handler: this.submit,
        }
    }

    static PARTS = {

        form: {
            template: "systems/impmal/templates/apps/buy-ammo.hbs",
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    }
    constructor(document, options)
    {
        super(document, options);

        if (this.document.system.category == "launcher" || this.document.system.category == "grenadesExplosives")
        {
            ui.notifications.error(game.i18n.localize("IMPMAL.ErrorTypeAmmo"));
            throw new Error(game.i18n.localize("IMPMAL.ErrorTypeAmmo"));
        }
        this.count = 1;
        this.total = 0;
    }


    async _prepareContext() 
    {
        let context = await super._prepareContext();
        context.count = this.count;
        context.total = this.count * this.document.system.ammoCost;
        context.buttons = [{ type: "submit", label: "IMPMAL.Buy", cssClass: "buy" }, {type: "submit", label : "IMPMAL.Free"}];
        return context;
    }


    static async submit(ev, form, formData)
    {
        let cost = ev.submitter.classList.contains("buy") ? this.document.system.ammoCost * formData.object.count : 0;
        let quantity = formData.object.count * this.document.system.mag.value;
        let name = this.document.name  + " Ammo";
        let existing = this.document.actor.itemTypes["ammo"].find(i => i.name == name); // Ammo with the same name already owned by Actor (don't create duplicates)
        // Check if Actor can afford ammo
        if (this.document.actor)
        {
            if (cost > this.document.actor.system.solars)
            {
                ui.notifications.error(game.i18n.localize("IMPMAL.NotEnoughSolars"));
                throw Error(game.i18n.localize("IMPMAL.NotEnoughSolars"));
            }
            await this.document.actor.update({"system.solars" : this.document.actor.system.solars - cost});
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
                "system.cost" : this.document.system.ammoCost * formData.object.count, // Cost might be 0 (if free) so recalculate it here
                "system.availability" : this.findAmmoAvailability(this.document.system.availability)
            }, {parent : this.document.actor});

        }

        ChatMessage.create({
            speaker : ChatMessage.getSpeaker({actor : this.document.actor}),
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

    async _onRender(options)
    {
        await super._onRender(options);

        this.element.querySelectorAll("input").forEach(e => e.addEventListener("change", ev => {
            this[ev.target.name] = Number(ev.target.value);
            this.render({force : true});
        }))

    }
}