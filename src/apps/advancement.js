export class AdvancementForm extends HandlebarsApplicationMixin(ApplicationV2)
{
    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["impmal", "warhammer", "advancement"],
        window: {
            title: "IMPMAL.Advancement",
            contentClasses: ["standard-form"],
            resizable : true
        },
        position: {
            height: 600,
            width: 500
        },
        form: {
            handler: this.submit,
            submitOnChange: false,
            closeOnSubmit: true
        },
        actions: {
            stepValue: this._onStepValue,
            removeType: this._onRemoveType
        }
    };



    static TABS = {
        sheet: {
            tabs: [
                { id: "characteristics", label: "IMPMAL.Characteristics" },
                { id: "skills", label: "IMPMAL.Skills" },
                { id: "items", label: "IMPMAL.Items" },
                { id: "log", label: "IMPMAL.Log" },
                { id: "other", label: "IMPMAL.Offsets" }
            ],
            initial: "characteristics"
        }
    }


    static PARTS = {
        tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },

        form: {
            template: "systems/impmal/templates/apps/advancement.hbs",
            scrollable: [],
        },
        footer: {
            template: "templates/generic/form-footer.hbs"
        }
    };

    constructor(actor, options) {
        super(options);
        this.actorCopy = actor.clone();
        this.document = actor;
    }


    async _prepareContext(options) 
    {
        let context = await super._prepareContext(options);

        context.actor = this.actorCopy;
        context.document = this.document;
        context.canEditXP = game.user.isGM || game.settings.get("impmal", "playerExperienceEditing");
        context.talentsAndPowers = this.actorCopy.itemTypes.power.concat(this.actorCopy.itemTypes.talent);

        context.buttons = [{ type: "submit", label: "Submit" }];
        return context;
    }

    static submit(ev, form, formData) 
    {
        this.document.update(this.actorCopy.toObject());
    }

    static _onStepValue(ev, target) 
    {
        let value = target.dataset.type == "increase" ? 1 : -1;
        let itemId = target.dataset.item;
        let skillKey = target.dataset.skill;
        let characteristicKey = target.dataset.characteristic;

        if (itemId) {
            let item = this.actorCopy.items.get(itemId);
            item.updateSource({ "system.advances": item.system.advances + value });
        }
        else if (skillKey) {
            this.actorCopy.updateSource({ [`system.skills.${skillKey}.advances`]: this.actorCopy.system.skills[skillKey].advances + value });
        }
        else if (characteristicKey) {
            this.actorCopy.updateSource({ [`system.characteristics.${characteristicKey}.advances`]: this.actorCopy.system.characteristics[characteristicKey].advances + value });
        }

        this.render({force : true})
    }

    static _onAddType(ev, target) 
    {
        if (target.dataset.type == "other")
        {
            let newOther = { [`${target.name}`]: (Number.isNumeric(target.value) ? Number(target.value) : (target.value || 0)) };
            this.actorCopy.updateSource({ "system.xp": this.actorCopy.system.xp.other.add(newOther) });
        }

        this.render({force : true})
    }
    static _onEditType(ev, target) 
    {
        let index = ev.target.parentElement.dataset.index;

        if (target.dataset.type == "other")
        {
            let other = this.actorCopy.system.xp.other.list[index];
            other[target.name] = Number.isNumeric(target.value) ? Number(target.value) : (target.value);

            let newList;

            // If both values deleted, remove the element
            if (!other.description && !other.xp) {
                newList = this.actorCopy.system.xp.other.remove(index);
            }
            else // Otherwise just edit the element
            {
                newList = this.actorCopy.system.xp.other.edit(index, other);
            }

            this.actorCopy.updateSource({ "system.xp": newList });
        }
        else if (target.dataset.type == "log")
        {
            let newList = this.actorCopy.system.xp.log.edit(index, { reason: target.value });
            this.actorCopy.updateSource({ "system.xp": newList });
            this.render(true);
        }
        this.render({force : true})

    }
    static async _onRemoveType(ev, target) 
    {
        let index = ev.target.parentElement.dataset.index;
        let entry = this.actorCopy.system.xp.log.list[index];
        let revert = await foundry.applications.api.DialogV2.confirm({ content: `Revert ${entry.xp} XP?` })
        let newList = this.actorCopy.system.xp.log.remove(index);

        if (revert) {
            this.actorCopy.updateSource({ "system.xp.total": this.actorCopy.system.xp.total - entry.xp });
        }
        this.actorCopy.updateSource({ "system.xp": newList });

        this.render({force : true})
    }

    async _onRender(options)
    {
        await super._onRender(options);

        this.element.querySelectorAll("[data-action='addType']").forEach(e => e.addEventListener("change", (ev) => (this.constructor._onAddType.bind(this))(ev, e)));
        this.element.querySelectorAll("[data-action='editType']").forEach(e => e.addEventListener("change", (ev) => (this.constructor._onEditType.bind(this))(ev, e)));
    }

}