
import { SkillTestDialog } from "./skill-dialog";

export class PowerTestDialog extends SkillTestDialog
{
    subTemplate = `systems/impmal/templates/apps/test-dialog/power-fields.hbs`;
    

    computeFields() 
    {
        super.computeFields();

        if (this.fields.push)
        {
            this.advCount++;
        }
    
    }

    get power() 
    {
        return this.actor.items.get(this.data.powerId);
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

        let power = actor.items.get(id);
        let discipline = power.system.discipline == "minor" ? power.system.minorSpecialisation : power.system.discipline; // Minor powers can use specialisations
        let skill = actor.system.skills.psychic.specialisations.find(i => i.name == game.impmal.config.disciplines[discipline]);

        // Prioritize specified difficulty, fallback on power's difficulty
        fields.difficulty = fields.difficulty || power.system.difficulty;

        let dialogData = super.setupData({key : "psychic", itemId : skill?.id}, actor, {title, fields, context});

        // TODO find a way to avoid duplicating this code from the parent class
        dialogData.data.title = (title?.replace || game.i18n.format("IMPMAL.PowerTest", {name : power.name})) + (title?.append || "");

        dialogData.data.powerId = power.id;
        dialogData.data.power = power;

        dialogData.data.scripts = dialogData.data.scripts.concat(power.getScripts("dialog"));

        
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