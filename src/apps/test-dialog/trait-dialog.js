import log from "../../system/logger";
import { AttackDialog } from "./attack-dialog";


export class TraitTestDialog extends AttackDialog
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
        let skillKey = trait.system.attack.skill.key || trait.system.attack.type;

        let dialogData = super.setupData({name : trait.system.attack.skill.specialisation, key : skillKey}, actor, {title, fields});

        // TODO find a way to avoid duplicating this code from the parent class
        dialogData.data.title = (title?.replace || game.i18n.format("IMPMAL.TraitTest", {trait : trait?.name})) + (title?.append || "");

        dialogData.data.itemId = trait?.id;
        
        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }
}