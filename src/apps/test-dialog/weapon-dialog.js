import log from "../../system/logger";
import { AttackDialog } from "./attack-dialog";

export class WeaponTestDialog extends AttackDialog
{  



    computeFields() 
    {
        super.computeFields();

        if (this.data.weapon.system.equipped.offhand)
        {
            this.disCount++;
        }
    
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
    static setupData(id, actor, {title={}, fields={}}={})
    {   
        log(`${this.prototype.constructor.name} - Setup Dialog Data`, {args : Array.from(arguments).slice(2)});

        let weapon = actor.items.get(id);
        let skill = weapon.system.skill;
        
        // If skill is a SkillSpec Item, provide the id, if not, provide the skill key
        let dialogData = super.setupData({itemId : skill.id, key : weapon.system.attackType}, actor, {title, fields});

        // TODO find a way to avoid duplicating this code from the parent class
        dialogData.data.title = (title?.replace || game.i18n.format("IMPMAL.WeaponTest", {name : weapon.name})) + (title?.append || "");

        dialogData.data.weaponId = weapon.id;
        dialogData.data.weapon = weapon;
        
        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }
}