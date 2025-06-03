
import { SkillTestDialog } from "./skill-dialog";

export class PowerTestDialog extends SkillTestDialog
{

    computeFields() 
    {

        if (this.fields.push)
        {
            this.advantage++;
        }
        super.computeFields();
    }

    get power() 
    {
        return this.actor.items.get(this.data.powerId);
    } 

    static PARTS = {
        fields : {
            template : "systems/impmal/templates/apps/test-dialog/test-dialog.hbs",
            fields: true
        },
        power : {
            template : "systems/impmal/templates/apps/test-dialog/power-fields.hbs",
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

        let power = actor.items.get(id);
        let discipline = power.system.discipline == "minor" ? power.system.minorSpecialisation : power.system.discipline; // Minor powers can use specialisations
        let skill = actor.system.skills.psychic.specialisations.find(i => i.name == game.impmal.config.disciplines[discipline]);

        // Prioritize specified difficulty, fallback on power's difficulty
        foundry.utils.setProperty(context, "fields.difficulty", context.fields?.difficulty || power.system.difficulty);
        
        let dialogData = super.setupData({key : "psychic", itemId : skill?.id}, actor, context, options);



        dialogData.data.powerId = power.id;
        dialogData.data.power = power;

        dialogData.data.scripts = dialogData.data.scripts.concat(power.getScripts("dialog").filter(i => !i.options.defending));

        
        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }

    _defaultFields() 
    {
        let fields = super._defaultFields();
        fields.push = false;
        return fields;
    }
}