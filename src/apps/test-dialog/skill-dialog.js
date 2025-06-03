
import { CharacteristicTestDialog } from "./characteristic-dialog";

export class SkillTestDialog extends CharacteristicTestDialog
{

    get skillItem() 
    {
        return this.actor.items.get(this.data.skillItemId);
    }

    get skill()
    {
        return this.data.skill;
    }

    get item()
    {
        return this.data.skill;
    }


    static PARTS = {
        fields : {
            template : "systems/impmal/templates/apps/test-dialog/test-dialog.hbs",
            fields: true
        },
        skill : {
            template : "systems/impmal/templates/apps/test-dialog/skill-fields.hbs",
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
    static setupData({itemId, name, key}, actor, context={}, options)
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

        let dialogData = super.setupData(characteristic, actor, context, options);

        if (name == "Dodge" || (actor.defendingAgainst && skillKey == "reflexes"))
        {
            dialogData.context.dodge = true;
        }

        // TODO find a way to avoid duplicating this code from the parent class
        dialogData.data.title = (context.title || game.i18n.format("IMPMAL.SkillTest", {skill : game.impmal.config.skills[skillKey] + (skillItem?.name ? ` (${skillItem.name})` : "")})) + (context.appendTitle || "");

        dialogData.data.skillItemId = skillItem?.id;
        dialogData.data.skill = skillKey;

        if (skillItem)
        {
            dialogData.data.scripts = dialogData.data.scripts.concat(skillItem.getScripts("dialog").filter(i => !i.options.defending));
        }

        dialogData.fields.characteristic = context.fields?.characteristic || skillObject.characteristic;
        
        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }
}