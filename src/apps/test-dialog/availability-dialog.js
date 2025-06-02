
import { TestDialog } from "./test-dialog";

export class AvailabilityDialog extends TestDialog
{
    subTemplate = `systems/impmal/templates/apps/test-dialog/availability-fields.hbs`;

    activateListeners(html)
    {
        super.activateListeners(html);
        html.find(".form-group:has([name='SL']")?.remove();
        html.find(".form-group:has([name='difficulty']")?.remove();
    }

    submit(ev) 
    {
        ev.preventDefault();
        ev.stopPropagation();
        if (!this.fields.world)
        {
            return ui.notifications.error(game.i18n.localize("IMPMAL.ErrorSelectWorld"));
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

    /**
     * 
     */
    static setupData({item, world, availability}, actor, context, options)
    {
        log(`${this.prototype.constructor.name} - Setup Dialog Data`, {args : Array.from(arguments).slice(2)});

        let dialogData = super.setupData(actor || game.user.character, undefined, context, options);
        dialogData.data.targets = [];
        // TODO find a way to avoid duplicating this code from the parent class
        dialogData.data.title = (context.title?.replace || game.i18n.localize("IMPMAL.Availability")) + (context.title?.append || "");
        dialogData.data.scripts = [];
        dialogData.data.item = item;
        dialogData.fields.cost = item.system.cost;
        dialogData.fields.world = world;
        dialogData.fields.availability = availability || item.system.availability;

        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }
}