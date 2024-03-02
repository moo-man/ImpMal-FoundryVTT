import log from "../../system/logger";
import { DialogTooltips } from "./tooltips";

export class TestDialog extends Application
{

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "test-dialog", "form"]);
        options.width = 500;
        options.resizable = true;
        return options;
    }

    #onKeyPress;
    selectedScripts = [];
    unselectedScripts = [];
    fieldsTemplate = "";
    
    get template() 
    {
        return `systems/impmal/templates/apps/test-dialog/test-dialog.hbs`;
    }

    get title() 
    {
        return this.data.title;
    }

    get actor() 
    {
        return ChatMessage.getSpeakerActor(this.data.speaker);
    }

    get context() 
    {
        return this.data.context;
    }

    constructor(data={}, fields={}, resolve)
    {
        super();
        this.data = data;
        this.fields = mergeObject(this._defaultFields(),fields);
        this.userEntry = foundry.utils.deepClone(this.fields);
        this.tooltips = new DialogTooltips();

        // Keep count of sources of advantage and disadvantage
        this.advCount = 0;
        this.disCount = 0;
        this.forceState = undefined;
        // If the user specifies a state, use that

        // If an effect deems this dialog cannot be rolled, it can switch this property to true and the dialog will close
        this.abort = false;

        // The flags object is for scripts to use freely, but it's mostly intended for preventing duplicate effects
        // A specific object is needed as it must be cleared every render when scripts run again
        this.flags = {};

        if (resolve)
        {
            this.resolve = resolve;
        }
    }

    _defaultFields() 
    {
        return {
            modifier : 0,
            SL : 0,
            difficulty : "challenging",
            state : "none",
            rollmode : game.settings.get("core", "rollMode") || "publicroll"
        };
    }

    async _render(...args)
    {
        await super._render(args);
        
        if (this.abort)
        {
            this.close();
        }
    }

    async getData() 
    {
        this.advCount = 0;
        this.disCount = 0;

        this.tooltips.clear();
        this.flags = {};

        // Reset values so they don't accumulate 
        
        mergeObject(this.fields, this.userEntry);

        // calling tooltips.start/finish between the merge object caused issues
        this.tooltips.addModifier(this.userEntry.modifier, "User Entry");
        this.tooltips.addSL(this.userEntry.SL, "User Entry");

        // For some reason cloning the scripts doesn't prevent isActive and isHidden from persisisting
        // So for now, just reset them manually
        this.data.scripts.forEach(script => 
        {
            script.isHidden = false;
            script.isActive = false;
        });
        
        this._hideScripts();
        this._activateScripts();
        await this.computeScripts();
        await this.computeFields();

        let state = this.computeState();

        return {
            scripts : this.data.scripts,
            fields : mergeObject(this.fields, {state}),
            advCount : this.advCount,
            disCount : this.disCount,
            tooltips : this.tooltips,
            subTemplate : await this.getFieldsTemplate()
        };
    }

    updateTargets()
    {
        this.data.targets = Array.from(game.user.targets);
        this.render(true);
    }

    _hideScripts()
    {
        this.data.scripts.forEach((script, index) => 
        {
            // If user selected script, make sure it is not hidden, otherwise, run its script to determine
            if (this.selectedScripts.includes(index))
            {
                script.isHidden = false;
            }
            else
            {
                script.isHidden = script.hidden(this);
            }
        });
    }

    _activateScripts()
    {
        this.data.scripts.forEach((script, index) => 
        {
            // If user selected script, activate it, otherwise, run its script to determine
            if (this.selectedScripts.includes(index))
            {
                script.isActive = true;
            }
            else if (this.unselectedScripts.includes(index))
            {
                script.isActive = false;
            }
            else if (!script.isHidden) // Don't run hidden script's activation test
            {
                script.isActive = script.activated(this);
            }
        });
    }

    /**
     * Compute whether disadvantage or advantage should be selected
     */
    computeState()
    {
        if (this.forceState) //"adv" "dis" and "none"
        {
            return this.forceState;
        }

        else if (this.advCount > this.disCount && this.advCount > 0)
        {
            this.tooltips.start(this);
            this.fields.modifier += 10 * ((this.advCount - 1) - this.disCount);
            this.tooltips.finish(this, "Excess Advantage");
            return "adv";
        }

        else if (this.disCount > this.advCount && this.disCount > 0)
        {
            this.tooltips.start(this);
            this.fields.modifier -= 10 * ((this.disCount - 1) - this.advCount);
            this.tooltips.finish(this, "Excess Disadvantage");
            return "dis";

        }

        else 
        {
            return "none";
        }
    }

    /**
     * Handle relationships between fields, used by subclasses
     */
    async computeFields() 
    {

    }

    
    async computeScripts() 
    {
        for(let script of this.data.scripts)
        {
            if (script.isActive)
            {
                this.tooltips.start(this);
                await script.execute(this);
                this.tooltips.finish(this, script.Label);
            }
        }
    }

    /**
     * Allows subclasses to insert custom fields
     */
    async getFieldsTemplate()
    {
        if (this.fieldsTemplate)
        {
            return await renderTemplate(this.fieldsTemplate, await this.getTemplateFields());
        }
    }

    /**
     * Provide data to a dialog's custom field section
     */
    async getTemplateFields() 
    {
        return {fields : this.fields};
    }

    submit(ev) 
    {
        ev.preventDefault();
        ev.stopPropagation();
        let dialogData = mergeObject(this.data, this.fields);
        dialogData.context.breakdown = this.tooltips.getBreakdown(this);

        for(let script of this.data.scripts)
        {
            if (script.isActive)
            {
                script.submission(this);
            }
        }

        if (this.resolve)
        {
            this.resolve(dialogData);
        }
        this.close();
        return dialogData;
    }

    close() 
    {
        super.close();
        document.removeEventListener("keypress", this.#onKeyPress);
    }

    activateListeners(html) 
    {
        this.form = html[0];
        this.form.onsubmit = this.submit.bind(this);

        // Listen on all elements with 'name' property
        html.find(Object.keys(new FormDataExtended(this.form).object).map(i => `[name='${i}']`).join(",")).change(this._onInputChanged.bind(this));

        html.find(".dialog-modifiers .modifier").click(this._onModifierClicked.bind(this));

        // Need to remember binded function to later remove
        this.#onKeyPress = this._onKeyPress.bind(this);
        document.addEventListener("keypress", this.#onKeyPress);
    }

    _onInputChanged(ev) 
    {
        let value = ev.currentTarget.value;
        if (Number.isNumeric(value))
        {
            value = Number(value);
        }

        if (ev.currentTarget.type == "checkbox")
        {
            value = ev.currentTarget.checked;
        }

        this.userEntry[ev.currentTarget.name] = value;

        // If the user clicks advantage or disadvantage, force that state to be true despite calculations
        if (ev.currentTarget.name == "state")
        {
            this.forceState = value;
        }
        this.render(true);
    }

    _onModifierClicked(ev)
    {
        let index = Number(ev.currentTarget.dataset.index);
        if (!ev.currentTarget.classList.contains("active"))
        {
            // If modifier was unselected by the user (originally activated via its script)
            // it can be assumed that the script will still be activated by its script
            if (this.unselectedScripts.includes(index))
            {
                this.unselectedScripts = this.unselectedScripts.filter(i => i != index);
            }
            else 
            {
                this.selectedScripts.push(index);
            }
        }
        else 
        {
            // If this modifier was NOT selected by the user, it was activated via its script
            // must be added to unselectedScripts instead
            if (!this.selectedScripts.includes(index))
            {
                this.unselectedScripts.push(index);
            }
            else // If unselecting manually selected modifier
            {
                this.selectedScripts = this.selectedScripts.filter(i => i != index);
            }
        }
        this.render(true);
    }

    _onKeyPress(ev)
    {
        if (ev.key == "Enter")
        {
            this.submit(ev); 
        }
    }

    /**
     * 
     * @param {object} data Dialog data, such as title and actor
     * @param {object} data.title.replace Custom dialog/test title
     * @param {object} data.title.append Append something to the test title
     * @param {object} fields Predefine dialog fields
     */
    static awaitSubmit({data={}, fields={}}={})
    {
        return new Promise(resolve => 
        {
            new this(data, fields, resolve).render(true);
        });
    }

    /**
     * 
     * @param {object} actor Actor performing the test
     * @param {object} data Dialog data, such as title and actor
     * @param {object} fields Predefine dialog fields
     */
    static setupData(actor, target, {title={}, fields={}, context={}}={})
    {
        log(`${this.prototype.constructor.name} - Setup Dialog Data`, {args : Array.from(arguments).slice(2)});

        let dialogData = {data : {}, fields};
        if (actor)
        {
            dialogData.data.speaker = ChatMessage.getSpeaker({actor});
        }
        dialogData.data.context = context; // Arbitrary values - used with scripts
        dialogData.data.context.tags = context.tags || {}; // Tags shown below test results - used with scripts
        dialogData.data.context.text = context.text || {}; // Longer text shown below test results - used with scripts
        if (actor && !actor?.token)
        {
            // getSpeaker retrieves tokens even if this sheet isn't a token's sheet
            delete dialogData.data.speaker.scene;
        }
        dialogData.data.title = (title?.replace || game.i18n.localize("IMPMAL.Test")) + (title?.append || "");
        if (target)
        {
            dialogData.data.target = target;
        }

        dialogData.fields.difficulty = dialogData.fields.difficulty || "challenging";

        dialogData.data.targets = actor?.defendingAgainst ? [] : Array.from(game.user.targets).filter(t => t.document.id != dialogData.data.speaker.token); // Remove self from targets

        // Collect Dialog effects 
        //   - Don't use our own targeter dialog effects, DO use targets' targeter dialog effects
        dialogData.data.scripts = foundry.utils.deepClone(
            (dialogData.data.targets 
                .map(t => t.actor)
                .filter(actor => actor)
                .reduce((prev, current) => prev.concat(current.getScripts("dialog", (s) => s.options.dialog?.targeter)), []) // Retrieve targets' targeter dialog effects
                .concat(actor?.getScripts("dialog", (s) => !s.options.dialog?.targeter) // Don't use our own targeter dialog effects
                ))) || [];

        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }

    static updateActiveDialogTargets() 
    {
        Object.values(ui.windows).forEach(i => 
        {
            if (i instanceof TestDialog)
            {
                i.updateTargets();
            }
        });
    }
}