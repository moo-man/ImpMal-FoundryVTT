
import { AttackDialog } from "./attack-dialog";

export class WeaponTestDialog extends AttackDialog
{  
    computeFields() 
    {
        if (this.data.weapon.system.equipped.offhand)
        {
            this.disadvantage++;
            this.tooltips.add("disadvantage", 1, "Offhand");
        }
        super.computeFields();    
    }

    get weapon() 
    {
        return this.data.weapon;
    } 

    get item()
    {
        return this.data.weapon;
    }

    static PARTS = {
        fields : {
            template : "systems/impmal/templates/apps/test-dialog/test-dialog.hbs",
            fields: true
        },
        attack : {
            template : "systems/impmal/templates/apps/test-dialog/attack-fields.hbs",
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
     * @param {string} characteristic Characteristic key, such as "ws" or "str"
     * @param {object} actor Actor performing the test
     * @param {object} title Customize dialog title
     * @param {string} title.replace Replace dialog title
     * @param {string} title.append Append to dialog title
     * @param {object} fields Predefine dialog fields
     */
    static setupData(id, actor, context={}, options)
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
        let dialogData = super.setupData({itemId : skill.id, key : weapon.system.attackType}, actor, context, options);


        dialogData.data.weapon = weapon;
        dialogData.data.item = weapon;
        dialogData.data.vehicle = weapon.actor?.type == "vehicle" ? weapon.actor : null;

        dialogData.data.scripts = dialogData.data.scripts.concat(weapon.getScripts("dialog").filter(i => !i.options.defending));
        
        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }
}