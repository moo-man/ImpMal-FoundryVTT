
import { AttackDialog } from "./attack-dialog";

export class WeaponTestDialog extends AttackDialog
{  



    computeFields() 
    {
        super.computeFields();

        if (this.data.weapon.system.equipped.offhand)
        {
            this.disCount++;
            this.tooltips.addDisadvantage(1, "Offhand");
        }

        if (this.data.weapon.system.traits.has("mastercrafted"))
        {
            this.fields.SL++;
            this.tooltips.addSL(1, "Mastercrafted");
        }
    
    }

    get weapon() 
    {
        return this.data.weapon;
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
    static setupData(id, actor, {title={}, fields={}, context={}}={})
    {   
        log(`${this.prototype.constructor.name} - Setup Dialog Data`, {args : Array.from(arguments).slice(2)});

        let weapon = id.includes(".") ? fromUuidSync(id) : actor.items.get(id); // Could be a vehicle weapon, in which case it's a uuid
        if (weapon.actor?.type == "vehicle")
        {
            weapon.system.computeOwned(actor);
        }
        let skill = weapon.system.skill;

        if (!weapon.system.hasAmmo())
        {
            ui.notifications.warn(game.i18n.localize("IMPMAL.NotEnoughAmmo"));
            throw Error(game.i18n.localize("IMPMAL.NotEnoughAmmo"));
        }
        
        // If skill is a SkillSpec Item, provide the id, if not, provide the skill key
        let dialogData = super.setupData({itemId : skill.id, key : weapon.system.attackType}, actor, {title, fields, context});

        // TODO find a way to avoid duplicating this code from the parent class
        dialogData.data.title = (title?.replace || game.i18n.format("IMPMAL.WeaponTest", {name : weapon.name})) + (title?.append || "");

        dialogData.data.additionalDamage = 0;
        dialogData.data.weapon = weapon;
        dialogData.data.item = weapon;
        dialogData.data.vehicle = weapon.actor?.type == "vehicle" ? weapon.actor : null;

        dialogData.data.scripts = dialogData.data.scripts.concat(weapon.getScripts("dialog") || []);
        
        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }
}