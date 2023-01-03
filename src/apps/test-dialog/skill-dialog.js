import log from "../../system/logger";
import { CharacteristicTestDialog } from "./characteristic-dialog";

export class SkillTestDialog extends CharacteristicTestDialog
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        // options.classes = options.classes.concat(["impmal", "test-dialog", "form"]);
        return options;
    }

    
    get template() 
    {
        return `systems/impmal/templates/apps/test-dialog/test-dialog.hbs`;
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
    static setupData({itemId, key}, actor, {title={}, fields={}}={})
    {   
        log(`${this.prototype.constructor.name} - Setup Dialog Data`, {args : Array.from(arguments).slice(2)});

        let skillItem = actor.items.get(itemId);
        let skillKey = key || skillItem.system.skill;
        let skillObject = actor.system.skills[skillKey];
        let characteristic = skillObject.characteristic;

        let dialogData = super.setupData(characteristic, actor, {title, fields});

        // TODO find a way to avoid duplicating this code from the parent class
        dialogData.data.title = (title?.replace || game.i18n.format("IMPMAL.SkillTest")) + (title?.append || "");

        dialogData.data.skillItemId = skillItem?.id;
        dialogData.data.skill = skillKey;
        
        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }
}