
import { AttackDialog } from "./attack-dialog";


export class TraitTestDialog extends AttackDialog
{

    get item()
    {
        return this.data.item;
    }

    get trait()
    {
        return this.data.item;
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

        let trait = id.includes(".") ? fromUuidSync(id) : actor.items.get(id); // Account for UUID
        let skillKey = trait.system.attack.skill.key || trait.system.attack.type;

        let dialogData = super.setupData({name : trait.system.attack.skill.specialisation, key : skillKey}, actor, {title, fields, context});

        // TODO find a way to avoid duplicating this code from the parent class
        dialogData.data.title = (context.title?.replace || game.i18n.format("IMPMAL.TraitTest", {trait : trait?.name})) + (context.title?.append || "");

        dialogData.data.itemId = trait?.id;
        dialogData.data.item = trait;

        dialogData.data.scripts = dialogData.data.scripts.concat(trait.getScripts("dialog"));

        
        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }
}