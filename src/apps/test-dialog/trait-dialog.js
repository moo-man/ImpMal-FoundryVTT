import log from "../../system/logger";
import { SkillTestDialog } from "./skill-dialog";


export class TraitTestDialog extends SkillTestDialog
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
    static setupData(itemId, actor, {title={}, fields={}}={})
    {   
        log(`${this.prototype.constructor.name} - Setup Dialog Data`, {args : Array.from(arguments).slice(2)});

        let trait = actor.items.get(itemId);
        let skillItem = actor.itemCategories.specialisation.find(s => s.name == trait.system.attack.skill.specialisation);
        let skillKey = trait.system.attack.skill.key || trait.system.attack.type;

        let dialogData = super.setupData({skillItemId : skillItem?.id, key : skillKey}, actor, {title, fields});

        // TODO find a way to avoid duplicating this code from the parent class
        dialogData.data.title = (title?.replace || game.i18n.format("IMPMAL.TraitTest", {trait : trait?.name})) + (title?.append || "");

        dialogData.data.itemId = trait?.id;
        
        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }
}