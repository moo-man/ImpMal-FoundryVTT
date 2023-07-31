import log from "../../system/logger";
import { CharacteristicTestDialog } from "./characteristic-dialog";

export class SkillTestDialog extends CharacteristicTestDialog
{
    fieldsTemplate = `systems/impmal/templates/apps/test-dialog/skill-fields.hbs`;

    /**
     * 
     * @param {string} characteristic Characteristic key, such as "ws" or "str"
     * @param {object} actor Actor performing the test
     * @param {object} title Customize dialog title
     * @param {string} title.replace Replace dialog title
     * @param {string} title.append Append to dialog title
     * @param {object} fields Predefine dialog fields
     */
    static setupData({itemId, name, key}, actor, {title={}, fields={}, purge=false, warp=undefined}={})
    {   
        log(`${this.prototype.constructor.name} - Setup Dialog Data`, {args : Array.from(arguments).slice(2)});

        let skillItem = actor.items.get(itemId);
        
        // If name provided, find Skill by name (and make sure key is correct)
        if (!skillItem)
        {
            skillItem = actor.items.find(i => 
                i.type == "specialisation" && 
                i.name == name && 
                i.system.skill == key);
        }
        let skillKey = key || skillItem.system.skill;
        let skillObject = actor.system.skills[skillKey];
        let characteristic = skillObject.characteristic;

        let dialogData = super.setupData(characteristic, actor, {title, fields});

        // TODO find a way to avoid duplicating this code from the parent class
        dialogData.data.title = (title?.replace || game.i18n.format("IMPMAL.SkillTest", {skill : skillItem?.name || game.impmal.config.skills[skillKey]})) + (title?.append || "");

        dialogData.data.skillItemId = skillItem?.id;
        dialogData.data.skill = skillKey;
        dialogData.data.purge = purge;
        dialogData.data.warp = warp;

        if (skillItem)
        {
            dialogData.data.scripts = dialogData.data.scripts.concat(skillItem.getScripts("dialog"));
        }

        dialogData.fields.characteristic = fields.characteristic || skillObject.characteristic;
        
        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }
}