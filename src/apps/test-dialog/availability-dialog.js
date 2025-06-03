
import { TestDialog } from "./test-dialog";

export class AvailabilityDialog extends TestDialog
{
    static DEFAULT_OPTIONS = {
        form : {
            handler : this.submit,
            submitOnChange : false,
            closeOnSubmit : true,
        }
    };


    async _onRender(options)
    {
        await super._onRender(options);
        this.element.querySelector(".form-group:has([name='SL']")?.remove();
        this.element.querySelector(".form-group:has([name='difficulty']")?.remove();
    }

    static submit(ev) 
    {
        ev.preventDefault();
        ev.stopPropagation();
        if (!this.fields.world)
        {
            throw new Error(game.i18n.localize("IMPMAL.ErrorSelectWorld"))
        }
        else 
        {
            super.submit(ev);
        }
    }

    get availability()
    {
        return true;
    }

    static PARTS = {
        fields : {
            template : "systems/impmal/templates/apps/test-dialog/test-dialog.hbs",
            fields: true
        },
        availability : {
            template : "systems/impmal/templates/apps/test-dialog/availability-fields.hbs",
            fields: true
        },
        state : {
            template : "systems/impmal/templates/apps/test-dialog/dialog-state.hbs",
            fields: true
        },
        mode : {
            template : "modules/warhammer-lib/templates/apps/dialog/dialog-mode.hbs",
            fields: true
        },
        modifiers : {
            template : "modules/warhammer-lib/templates/partials/dialog-modifiers.hbs",
            modifiers: true
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    }

    /**
     * 
     */
    static setupData({item, world, availability}, actor, context={}, options)
    {
        log(`${this.prototype.constructor.name} - Setup Dialog Data`, {args : Array.from(arguments).slice(2)});

        let dialogData = super.setupData(actor || game.user.character, undefined, context, options);
        dialogData.data.targets = [];
        // TODO find a way to avoid duplicating this code from the parent class
        dialogData.data.title = (context.title || game.i18n.localize("IMPMAL.Availability")) + (context.appendTitle || "");
        dialogData.data.scripts = [];
        dialogData.data.item = item;
        dialogData.fields.cost = item.system.cost;
        dialogData.fields.world = world;
        dialogData.fields.availability = availability || item.system.availability;

        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }
}