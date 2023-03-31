import log from "../../system/logger";
import { SkillTestDialog } from "./skill-dialog";

export class PowerTestDialog extends SkillTestDialog
{
    fieldsTemplate = `systems/impmal/templates/apps/test-dialog/power-fields.hbs`;
    

    computeFields() 
    {
        super.computeFields();

        if (this.fields.push)
        {
            this.advCount++;
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

        let power = actor.items.get(id);
        let skill = actor.system.skills.psychic.specialisations.find(i => i.name == game.impmal.config.disciplines[power.system.discipline]);

        // Prioritize specified difficulty, fallback on power's difficulty
        fields.difficulty = fields.difficulty || power.system.difficulty;

        let dialogData = super.setupData({key : "psychic", itemId : skill?.id}, actor, {title, fields});

        // TODO find a way to avoid duplicating this code from the parent class
        dialogData.data.title = (title?.replace || game.i18n.format("IMPMAL.PowerTest", {name : power.name})) + (title?.append || "");

        dialogData.data.powerId = power.id;
        
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