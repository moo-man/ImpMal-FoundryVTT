import log from "../../system/logger";
import { TestDialog } from "./test-dialog";

export class CharacteristicTestDialog extends TestDialog
{
    /**
     * 
     * @param {string} characteristic Characteristic key, such as "ws" or "str"
     * @param {object} actor Actor performing the test
     * @param {object} title Customize dialog title
     * @param {string} title.replace Replace dialog title
     * @param {string} title.append Append to dialog title
     * @param {object} fields Predefine dialog fields
     */
    static setupData(characteristic, actor, {title={}, fields={}, other={}}={})
    {
        log(`${this.prototype.constructor.name} - Setup Dialog Data`, {args : Array.from(arguments).slice(2)});

        let dialogData = super.setupData(actor, undefined, {title, fields, other});

        // TODO find a way to avoid duplicating this code from the parent class
        dialogData.data.title = (title?.replace || game.i18n.format("IMPMAL.CharacteristicTest", {characteristic : game.impmal.config.characteristics[characteristic]})) + (title?.append || "");
        dialogData.data.characteristic = characteristic;

        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }
}