
import { TestDialog } from "./test-dialog";

export class CharacteristicTestDialog extends TestDialog
{

    get characteristic()
    {
        return this.data.characteristic;
    }
    /**
     * 
     * @param {string} characteristic Characteristic key, such as "ws" or "str"
     * @param {object} actor Actor performing the test
     * @param {object} title Customize dialog title
     * @param {string} title.replace Replace dialog title
     * @param {string} title.append Append to dialog title
     * @param {object} fields Predefine dialog fields
     */
    static setupData(characteristic, actor, context={}, options)
    {
        log(`${this.prototype.constructor.name} - Setup Dialog Data`, {args : Array.from(arguments).slice(2)});

        let dialogData = super.setupData(actor, undefined, context, options);

        // TODO find a way to avoid duplicating this code from the parent class
        dialogData.data.title = (context.title || game.i18n.format("IMPMAL.CharacteristicTest", {characteristic : game.impmal.config.characteristics[characteristic]})) + (context.appendTitle || "");
        dialogData.data.characteristic = characteristic;
        dialogData.data.itemUsed = context.itemUsed;
        delete context.itemUsed;
        if (context.itemUsed)
        {
            dialogData.data.scripts = dialogData.data.scripts.concat(context.itemUsed.getScripts("dialog").filter(i => !i.options.definding));
        }

        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }
}